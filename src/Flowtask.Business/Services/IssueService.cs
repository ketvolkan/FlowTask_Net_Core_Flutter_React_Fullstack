using AutoMapper;
using Flowtask.Business.DTOs.Issues;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class IssueService : IIssueService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;
    private readonly INotificationService _notificationService;

    public IssueService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IActivityLogService activityLogService,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _activityLogService = activityLogService;
        _notificationService = notificationService;
    }

    public async Task<IDataResult<IssueDto>> GetByIdAsync(Guid projectId, Guid issueId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IssueDto>("You do not have access to this project.");
        }

        var issue = await _unitOfWork.Issues.Query()
            .Include(i => i.Project)
            .Include(i => i.Reporter)
            .Include(i => i.Assignee)
            .Include(i => i.Sprint)
            .Include(i => i.Comments)
            .Include(i => i.Attachments)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, cancellationToken);

        if (issue == null)
        {
            return new ErrorDataResult<IssueDto>("Issue not found in this project.");
        }

        var dto = _mapper.Map<IssueDto>(issue);
        return new SuccessDataResult<IssueDto>(dto);
    }

    public async Task<PagedDataResult<IssueDto>> GetIssuesAsync(Guid projectId, IssueFilterParams filterParams, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new PagedDataResult<IssueDto>(new List<IssueDto>(), 0, filterParams.Page, filterParams.PageSize, "You do not have access to this project.");
        }

        var query = _unitOfWork.Issues.Query()
            .Include(i => i.Project)
            .Include(i => i.Reporter)
            .Include(i => i.Assignee)
            .Include(i => i.Sprint)
            .Include(i => i.Comments)
            .Include(i => i.Attachments)
            .Where(i => i.ProjectId == projectId);

        if (filterParams.Status.HasValue)
        {
            query = query.Where(i => i.Status == filterParams.Status.Value);
        }

        if (filterParams.Priority.HasValue)
        {
            query = query.Where(i => i.Priority == filterParams.Priority.Value);
        }

        if (filterParams.IssueType.HasValue)
        {
            query = query.Where(i => i.IssueType == filterParams.IssueType.Value);
        }

        if (filterParams.AssigneeId.HasValue)
        {
            query = query.Where(i => i.AssigneeId == filterParams.AssigneeId.Value);
        }

        if (filterParams.SprintId.HasValue)
        {
            query = query.Where(i => i.SprintId == filterParams.SprintId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filterParams.Search))
        {
            var search = filterParams.Search.Trim().ToLower();
            query = query.Where(i => i.Title.ToLower().Contains(search) || i.IssueKey.ToLower().Contains(search) || (i.Description != null && i.Description.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = query.OrderBy(i => i.OrderIndex).ThenByDescending(i => i.CreatedAt);

        var issues = await query
            .Skip((filterParams.Page - 1) * filterParams.PageSize)
            .Take(filterParams.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<IssueDto>>(issues);
        return new PagedDataResult<IssueDto>(dtos, totalCount, filterParams.Page, filterParams.PageSize, "Issues retrieved successfully.");
    }

    public async Task<IDataResult<IssueDto>> CreateAsync(Guid projectId, CreateIssueRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorDataResult<IssueDto>("Project not found.");
        }

        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IssueDto>("You do not have access to create issues in this project.");
        }

        var latestIssueNumber = await _unitOfWork.Issues.Query()
            .Where(i => i.ProjectId == projectId)
            .Select(i => (int?)i.IssueNumber)
            .MaxAsync(cancellationToken) ?? 0;

        var nextNumber = latestIssueNumber + 1;
        var issueKey = $"{project.Key}-{nextNumber}";

        var issue = new Issue
        {
            ProjectId = projectId,
            IssueKey = issueKey,
            IssueNumber = nextNumber,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            IssueType = request.IssueType,
            Priority = request.Priority,
            Status = request.Status,
            ReporterId = currentUserId,
            AssigneeId = request.AssigneeId,
            SprintId = request.SprintId,
            StoryPoints = request.StoryPoints,
            DueDate = request.DueDate,
            OrderIndex = nextNumber
        };

        await _unitOfWork.Issues.AddAsync(issue, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "ISSUE_CREATED", "Issue", issue.Id.ToString(), $"Issue '{issue.IssueKey}' created: {issue.Title}", cancellationToken: cancellationToken);

        if (issue.AssigneeId.HasValue && issue.AssigneeId.Value != currentUserId)
        {
            await _notificationService.SendNotificationAsync(
                issue.AssigneeId.Value,
                NotificationType.IssueAssigned,
                "Assigned to Issue",
                $"You were assigned to {issue.IssueKey}: {issue.Title}",
                $"/app/projects/{projectId}/issues/{issue.Id}",
                cancellationToken);
        }

        return await GetByIdAsync(projectId, issue.Id, currentUserId, isSystemAdmin, cancellationToken);
    }

    public async Task<IDataResult<IssueDto>> UpdateAsync(Guid projectId, Guid issueId, UpdateIssueRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IssueDto>("You do not have access to this project.");
        }

        var issue = await _unitOfWork.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (issue == null)
        {
            return new ErrorDataResult<IssueDto>("Issue not found in this project.");
        }

        var oldAssigneeId = issue.AssigneeId;

        issue.Title = request.Title.Trim();
        issue.Description = request.Description?.Trim();
        issue.IssueType = request.IssueType;
        issue.Priority = request.Priority;
        issue.AssigneeId = request.AssigneeId;
        issue.SprintId = request.SprintId;
        issue.StoryPoints = request.StoryPoints;
        issue.DueDate = request.DueDate;

        _unitOfWork.Issues.Update(issue);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "ISSUE_UPDATED", "Issue", issue.Id.ToString(), $"Issue '{issue.IssueKey}' updated", cancellationToken: cancellationToken);

        if (issue.AssigneeId.HasValue && issue.AssigneeId != oldAssigneeId && issue.AssigneeId.Value != currentUserId)
        {
            await _notificationService.SendNotificationAsync(
                issue.AssigneeId.Value,
                NotificationType.IssueAssigned,
                "Assigned to Issue",
                $"You were assigned to {issue.IssueKey}: {issue.Title}",
                $"/app/projects/{projectId}/issues/{issue.Id}",
                cancellationToken);
        }

        return await GetByIdAsync(projectId, issue.Id, currentUserId, isSystemAdmin, cancellationToken);
    }

    public async Task<IDataResult<IssueDto>> UpdateStatusAsync(Guid projectId, Guid issueId, UpdateIssueStatusRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IssueDto>("You do not have access to this project.");
        }

        var issue = await _unitOfWork.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (issue == null)
        {
            return new ErrorDataResult<IssueDto>("Issue not found in this project.");
        }

        var oldStatus = issue.Status;
        issue.Status = request.Status;
        if (request.OrderIndex.HasValue)
        {
            issue.OrderIndex = request.OrderIndex.Value;
        }

        _unitOfWork.Issues.Update(issue);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "ISSUE_STATUS_CHANGED", "Issue", issue.Id.ToString(), $"Issue '{issue.IssueKey}' status changed from '{oldStatus}' to '{request.Status}'", oldStatus.ToString(), request.Status.ToString(), cancellationToken: cancellationToken);

        if (issue.ReporterId != currentUserId)
        {
            await _notificationService.SendNotificationAsync(
                issue.ReporterId,
                NotificationType.IssueStatusChanged,
                "Issue Status Changed",
                $"{issue.IssueKey} was moved to {request.Status}",
                $"/app/projects/{projectId}/issues/{issue.Id}",
                cancellationToken);
        }

        return await GetByIdAsync(projectId, issue.Id, currentUserId, isSystemAdmin, cancellationToken);
    }

    public async Task<IDataResult<IssueDto>> AssignIssueAsync(Guid projectId, Guid issueId, AssignIssueRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IssueDto>("You do not have access to this project.");
        }

        var issue = await _unitOfWork.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (issue == null)
        {
            return new ErrorDataResult<IssueDto>("Issue not found in this project.");
        }

        issue.AssigneeId = request.AssigneeId;
        _unitOfWork.Issues.Update(issue);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "ISSUE_ASSIGNED", "Issue", issue.Id.ToString(), $"Issue '{issue.IssueKey}' assigned to user {request.AssigneeId}", cancellationToken: cancellationToken);

        if (issue.AssigneeId.HasValue && issue.AssigneeId.Value != currentUserId)
        {
            await _notificationService.SendNotificationAsync(
                issue.AssigneeId.Value,
                NotificationType.IssueAssigned,
                "Assigned to Issue",
                $"You were assigned to {issue.IssueKey}: {issue.Title}",
                $"/app/projects/{projectId}/issues/{issue.Id}",
                cancellationToken);
        }

        return await GetByIdAsync(projectId, issue.Id, currentUserId, isSystemAdmin, cancellationToken);
    }

    public async Task<IResult> DeleteAsync(Guid projectId, Guid issueId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorResult("You do not have access to this project.");
        }

        var issue = await _unitOfWork.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (issue == null)
        {
            return new ErrorResult("Issue not found in this project.");
        }

        await _unitOfWork.Issues.SoftDeleteAsync(issueId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "ISSUE_DELETED", "Issue", issue.Id.ToString(), $"Issue '{issue.IssueKey}' deleted", cancellationToken: cancellationToken);

        return new SuccessResult("Issue deleted successfully.");
    }

    private async Task<bool> HasProjectAccessAsync(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        return await _unitOfWork.Projects.AnyAsync(p => p.Id == projectId && (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)), cancellationToken);
    }
}

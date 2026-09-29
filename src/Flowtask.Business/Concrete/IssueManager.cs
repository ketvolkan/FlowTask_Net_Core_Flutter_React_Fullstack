using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Issues;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Concrete;

public class IssueManager : IIssueService
{
    private readonly IIssueDal _issueDal;
    private readonly IProjectDal _projectDal;
    private readonly IProjectMemberDal _projectMemberDal;
    private readonly IUserDal _userDal;
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;
    private readonly INotificationService _notificationService;

    public IssueManager(
        IIssueDal issueDal,
        IProjectDal projectDal,
        IProjectMemberDal projectMemberDal,
        IUserDal userDal,
        IMapper mapper,
        IActivityLogService activityLogService,
        INotificationService notificationService)
    {
        _issueDal = issueDal;
        _projectDal = projectDal;
        _projectMemberDal = projectMemberDal;
        _userDal = userDal;
        _mapper = mapper;
        _activityLogService = activityLogService;
        _notificationService = notificationService;
    }

    public async Task<IDataResult<PagedDataResult<IssueDto>>> GetIssuesAsync(Guid userId, IssueFilterParams filter)
    {
        var user = await _userDal.GetByIdAsync(userId);
        var isSysAdmin = user?.IsSystemAdmin ?? false;

        var (issues, totalCount) = await _issueDal.GetPagedAsync(
            filter: i =>
                (!filter.ProjectId.HasValue || i.ProjectId == filter.ProjectId.Value) &&
                (!filter.SprintId.HasValue || i.SprintId == filter.SprintId.Value) &&
                (!filter.AssigneeId.HasValue || i.AssigneeId == filter.AssigneeId.Value) &&
                (!filter.ReporterId.HasValue || i.ReporterId == filter.ReporterId.Value) &&
                (!filter.Status.HasValue || i.Status == filter.Status.Value) &&
                (!filter.Priority.HasValue || i.Priority == filter.Priority.Value) &&
                (!filter.Type.HasValue || i.Type == filter.Type.Value) &&
                (string.IsNullOrEmpty(filter.Search) || i.Title.ToLower().Contains(filter.Search.ToLower()) || i.Key.ToLower().Contains(filter.Search.ToLower()) || (i.Description != null && i.Description.ToLower().Contains(filter.Search.ToLower()))) &&
                (isSysAdmin || i.Project.Members.Any(m => m.UserId == userId) || i.Project.OwnerId == userId),
            page: filter.Page,
            pageSize: filter.PageSize,
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy",
            orderBy: q => q.OrderBy(i => i.Order));

        var dtos = _mapper.Map<List<IssueDto>>(issues);
        var pagedResult = PagedDataResult<IssueDto>.Create(dtos, totalCount, filter.Page, filter.PageSize);
        return new SuccessDataResult<PagedDataResult<IssueDto>>(pagedResult);
    }

    public async Task<IDataResult<IssueDto>> GetIssueByIdAsync(Guid issueId, Guid userId)
    {
        var user = await _userDal.GetByIdAsync(userId);
        var isSysAdmin = user?.IsSystemAdmin ?? false;

        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && (isSysAdmin || i.Project.Members.Any(m => m.UserId == userId) || i.Project.OwnerId == userId),
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var dto = _mapper.Map<IssueDto>(issue);
        return new SuccessDataResult<IssueDto>(dto);
    }

    public async Task<IDataResult<IssueDto>> CreateIssueAsync(Guid projectId, Guid userId, IssueCreateDto request)
    {
        var project = await _projectDal.GetByIdAsync(projectId);
        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        var isMember = await _projectMemberDal.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember && project.OwnerId != userId)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null || !user.IsSystemAdmin)
            {
                throw new ForbiddenException(Messages.AuthorizationDenied);
            }
        }

        // Determine highest existing issue key number safely
        var existingIssues = await _issueDal.GetListAsync(i => i.ProjectId == projectId);
        int maxNumber = 0;
        var prefix = $"{project.Key}-";
        foreach (var exIssue in existingIssues)
        {
            if (!string.IsNullOrEmpty(exIssue.Key) && exIssue.Key.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                var numPart = exIssue.Key.Substring(prefix.Length);
                if (int.TryParse(numPart, out int num) && num > maxNumber)
                {
                    maxNumber = num;
                }
            }
        }

        var issueNumber = maxNumber + 1;
        var issueKey = $"{project.Key}-{issueNumber}";

        var maxOrder = await _issueDal.CountAsync(i => i.ProjectId == projectId && i.Status == request.Status);

        // Sanitize optional Guid fields
        var cleanSprintId = (request.SprintId.HasValue && request.SprintId.Value != Guid.Empty) ? request.SprintId : null;
        var cleanAssigneeId = (request.AssigneeId.HasValue && request.AssigneeId.Value != Guid.Empty) ? request.AssigneeId : null;

        var issue = new Issue
        {
            ProjectId = projectId,
            Key = issueKey,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Type = request.Type,
            Priority = request.Priority,
            Status = request.Status,
            StoryPoints = request.StoryPoints,
            DueDate = request.DueDate,
            SprintId = cleanSprintId,
            ReporterId = userId,
            AssigneeId = cleanAssigneeId,
            Order = (maxOrder + 1) * 1000.0
        };

        await _issueDal.AddAsync(issue);

        var createdIssue = await _issueDal.GetAsync(
            i => i.Id == issue.Id,
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        var dto = _mapper.Map<IssueDto>(createdIssue);

        await _activityLogService.LogActivityAsync(userId, "CREATE", "Issue", issue.Id, $"Created issue {issue.Key}: {issue.Title}", projectId);

        // Send real-time notification to assignee if assigned
        if (cleanAssigneeId.HasValue && cleanAssigneeId.Value != userId)
        {
            var creator = await _userDal.GetByIdAsync(userId);
            var creatorName = creator?.FullName ?? "Bir ekip üyesi";
            await _notificationService.CreateAndSendNotificationAsync(
                cleanAssigneeId.Value,
                NotificationType.IssueAssigned,
                $"Yeni Görev Atandı: {issue.Key}",
                $"{creatorName} size '{issue.Title}' görevini atadı.",
                $"/board?issue={issue.Key}");
        }

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueCreated);
    }

    public async Task<IDataResult<IssueDto>> UpdateIssueAsync(Guid issueId, Guid userId, IssueUpdateDto request)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && (i.Project.Members.Any(m => m.UserId == userId) || i.Project.OwnerId == userId),
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var oldAssigneeId = issue.AssigneeId;
        var oldStatus = issue.Status;

        issue.Title = request.Title.Trim();
        issue.Description = request.Description?.Trim();
        issue.Type = request.Type;
        issue.Priority = request.Priority;
        issue.Status = request.Status;
        issue.StoryPoints = request.StoryPoints;
        issue.Order = request.Order;
        issue.DueDate = request.DueDate;
        issue.SprintId = (request.SprintId.HasValue && request.SprintId.Value != Guid.Empty) ? request.SprintId : null;
        issue.AssigneeId = (request.AssigneeId.HasValue && request.AssigneeId.Value != Guid.Empty) ? request.AssigneeId : null;
        issue.UpdatedAt = DateTime.UtcNow;

        await _issueDal.UpdateAsync(issue);

        var dto = _mapper.Map<IssueDto>(issue);
        await _activityLogService.LogActivityAsync(userId, "UPDATE", "Issue", issue.Id, $"Updated issue {issue.Key}", issue.ProjectId);

        // Notify new assignee if changed
        if (issue.AssigneeId.HasValue && issue.AssigneeId != oldAssigneeId && issue.AssigneeId.Value != userId)
        {
            var updater = await _userDal.GetByIdAsync(userId);
            var updaterName = updater?.FullName ?? "Bir ekip üyesi";
            await _notificationService.CreateAndSendNotificationAsync(
                issue.AssigneeId.Value,
                NotificationType.IssueAssigned,
                $"Yeni Görev Atandı: {issue.Key}",
                $"{updaterName} size '{issue.Title}' görevini atadı.",
                $"/board?issue={issue.Key}");
        }

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueUpdated);
    }

    public async Task<IDataResult<IssueDto>> UpdateStatusAsync(Guid issueId, Guid userId, UpdateIssueStatusDto request)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && (i.Project.Members.Any(m => m.UserId == userId) || i.Project.OwnerId == userId),
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var oldStatus = issue.Status;
        issue.Status = request.Status;
        if (request.Order.HasValue)
        {
            issue.Order = request.Order.Value;
        }
        if (request.SprintId.HasValue)
        {
            issue.SprintId = request.SprintId.Value != Guid.Empty ? request.SprintId.Value : null;
        }
        issue.UpdatedAt = DateTime.UtcNow;

        await _issueDal.UpdateAsync(issue);

        var dto = _mapper.Map<IssueDto>(issue);
        await _activityLogService.LogActivityAsync(userId, "STATUS_CHANGE", "Issue", issue.Id, $"Changed status of {issue.Key} from {oldStatus} to {request.Status}", issue.ProjectId);

        // Real-time automatic notification on status change
        if (oldStatus != request.Status)
        {
            var updater = await _userDal.GetByIdAsync(userId);
            var updaterName = updater?.FullName ?? "Bir ekip üyesi";

            if (issue.AssigneeId.HasValue && issue.AssigneeId.Value != userId)
            {
                await _notificationService.CreateAndSendNotificationAsync(
                    issue.AssigneeId.Value,
                    NotificationType.IssueStatusChanged,
                    $"Görev Durumu Güncellendi: {issue.Key}",
                    $"{updaterName} '{issue.Title}' görevini '{request.Status}' durumuna güncelledi.",
                    $"/board?issue={issue.Key}");
            }

            if (issue.ReporterId != userId && issue.ReporterId != issue.AssigneeId)
            {
                await _notificationService.CreateAndSendNotificationAsync(
                    issue.ReporterId,
                    NotificationType.IssueStatusChanged,
                    $"Görev Durumu Güncellendi: {issue.Key}",
                    $"{updaterName} '{issue.Title}' görevini '{request.Status}' durumuna güncelledi.",
                    $"/board?issue={issue.Key}");
            }
        }

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueStatusUpdated);
    }

    public async Task<IDataResult<IssueDto>> AssignIssueAsync(Guid issueId, Guid userId, AssignIssueDto request)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && (i.Project.Members.Any(m => m.UserId == userId) || i.Project.OwnerId == userId),
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var cleanAssigneeId = (request.AssigneeId.HasValue && request.AssigneeId.Value != Guid.Empty) ? request.AssigneeId : null;
        issue.AssigneeId = cleanAssigneeId;
        issue.UpdatedAt = DateTime.UtcNow;

        await _issueDal.UpdateAsync(issue);

        var updated = await _issueDal.GetAsync(
            i => i.Id == issueId,
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        var dto = _mapper.Map<IssueDto>(updated);
        await _activityLogService.LogActivityAsync(userId, "ASSIGN", "Issue", issue.Id, $"Assigned {issue.Key} to {dto.AssigneeName ?? "Unassigned"}", issue.ProjectId);

        // Real-time automatic notification on task assignment
        if (cleanAssigneeId.HasValue && cleanAssigneeId.Value != userId)
        {
            var assigner = await _userDal.GetByIdAsync(userId);
            var assignerName = assigner?.FullName ?? "Bir ekip üyesi";
            await _notificationService.CreateAndSendNotificationAsync(
                cleanAssigneeId.Value,
                NotificationType.IssueAssigned,
                $"Yeni Görev Atandı: {issue.Key}",
                $"{assignerName} size '{issue.Title}' görevini atadı.",
                $"/board?issue={issue.Key}");
        }

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueAssigned);
    }

    public async Task<IResult> DeleteIssueAsync(Guid issueId, Guid userId)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && (i.Project.Members.Any(m => m.UserId == userId) || i.Project.OwnerId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        await _issueDal.DeleteAsync(issue);

        await _activityLogService.LogActivityAsync(userId, "DELETE", "Issue", issue.Id, $"Deleted issue {issue.Key}", issue.ProjectId);

        return new SuccessResult(Messages.IssueDeleted);
    }
}

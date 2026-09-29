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
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;

    public IssueManager(
        IIssueDal issueDal,
        IProjectDal projectDal,
        IProjectMemberDal projectMemberDal,
        IMapper mapper,
        IActivityLogService activityLogService)
    {
        _issueDal = issueDal;
        _projectDal = projectDal;
        _projectMemberDal = projectMemberDal;
        _mapper = mapper;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<PagedDataResult<IssueDto>>> GetIssuesAsync(Guid userId, IssueFilterParams filter)
    {
        var (issues, totalCount) = await _issueDal.GetPagedAsync(
            filter: i =>
                (!filter.ProjectId.HasValue || i.ProjectId == filter.ProjectId.Value) &&
                (!filter.SprintId.HasValue || i.SprintId == filter.SprintId.Value) &&
                (!filter.AssigneeId.HasValue || i.AssigneeId == filter.AssigneeId.Value) &&
                (!filter.ReporterId.HasValue || i.ReporterId == filter.ReporterId.Value) &&
                (!filter.Status.HasValue || i.Status == filter.Status.Value) &&
                (!filter.Priority.HasValue || i.Priority == filter.Priority.Value) &&
                (!filter.Type.HasValue || i.Type == filter.Type.Value) &&
                (string.IsNullOrEmpty(filter.Search) || i.Title.ToLower().Contains(filter.Search.ToLower()) || i.Key.ToLower().Contains(filter.Search.ToLower())) &&
                i.Project.Members.Any(m => m.UserId == userId),
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
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId),
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
        var isMember = await _projectMemberDal.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var project = await _projectDal.GetByIdAsync(projectId);
        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        var issueCount = await _issueDal.CountAsync(i => i.ProjectId == projectId);
        var issueNumber = issueCount + 1;
        var issueKey = $"{project.Key}-{issueNumber}";

        var maxOrder = await _issueDal.CountAsync(i => i.ProjectId == projectId && i.Status == request.Status);

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
            SprintId = request.SprintId,
            ReporterId = userId,
            AssigneeId = request.AssigneeId,
            Order = (maxOrder + 1) * 1000.0
        };

        await _issueDal.AddAsync(issue);

        var createdIssue = await _issueDal.GetAsync(
            i => i.Id == issue.Id,
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        var dto = _mapper.Map<IssueDto>(createdIssue);

        await _activityLogService.LogActivityAsync(userId, "CREATE", "Issue", issue.Id, $"Created issue {issue.Key}: {issue.Title}", projectId);

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueCreated);
    }

    public async Task<IDataResult<IssueDto>> UpdateIssueAsync(Guid issueId, Guid userId, IssueUpdateDto request)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId),
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        issue.Title = request.Title.Trim();
        issue.Description = request.Description?.Trim();
        issue.Type = request.Type;
        issue.Priority = request.Priority;
        issue.Status = request.Status;
        issue.StoryPoints = request.StoryPoints;
        issue.Order = request.Order;
        issue.DueDate = request.DueDate;
        issue.SprintId = request.SprintId;
        issue.AssigneeId = request.AssigneeId;
        issue.UpdatedAt = DateTime.UtcNow;

        await _issueDal.UpdateAsync(issue);

        var dto = _mapper.Map<IssueDto>(issue);
        await _activityLogService.LogActivityAsync(userId, "UPDATE", "Issue", issue.Id, $"Updated issue {issue.Key}", issue.ProjectId);

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueUpdated);
    }

    public async Task<IDataResult<IssueDto>> UpdateStatusAsync(Guid issueId, Guid userId, UpdateIssueStatusDto request)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId),
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
            issue.SprintId = request.SprintId.Value;
        }
        issue.UpdatedAt = DateTime.UtcNow;

        await _issueDal.UpdateAsync(issue);

        var dto = _mapper.Map<IssueDto>(issue);
        await _activityLogService.LogActivityAsync(userId, "STATUS_CHANGE", "Issue", issue.Id, $"Changed status of {issue.Key} from {oldStatus} to {request.Status}", issue.ProjectId);

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueStatusUpdated);
    }

    public async Task<IDataResult<IssueDto>> AssignIssueAsync(Guid issueId, Guid userId, AssignIssueDto request)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId),
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        issue.AssigneeId = request.AssigneeId;
        issue.UpdatedAt = DateTime.UtcNow;

        await _issueDal.UpdateAsync(issue);

        var updated = await _issueDal.GetAsync(
            i => i.Id == issueId,
            includeProperties: "Project,Sprint,Reporter,Assignee,Comments.User,Attachments.UploadedBy");

        var dto = _mapper.Map<IssueDto>(updated);
        await _activityLogService.LogActivityAsync(userId, "ASSIGN", "Issue", issue.Id, $"Assigned {issue.Key} to {dto.AssigneeName ?? "Unassigned"}", issue.ProjectId);

        return new SuccessDataResult<IssueDto>(dto, Messages.IssueAssigned);
    }

    public async Task<IResult> DeleteIssueAsync(Guid issueId, Guid userId)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        await _issueDal.DeleteAsync(issue);

        await _activityLogService.LogActivityAsync(userId, "DELETE", "Issue", issue.Id, $"Deleted issue {issue.Key}", issue.ProjectId);

        return new SuccessResult(Messages.IssueDeleted);
    }
}

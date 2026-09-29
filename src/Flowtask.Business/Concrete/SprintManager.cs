using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.Sprints;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Concrete;

public class SprintManager : ISprintService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;

    public SprintManager(IUnitOfWork unitOfWork, IMapper mapper, IActivityLogService activityLogService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<List<SprintDto>>> GetProjectSprintsAsync(Guid projectId, Guid userId)
    {
        var isMember = await _unitOfWork.ProjectMembers.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var sprints = await _unitOfWork.Sprints.GetAllAsync(
            filter: s => s.ProjectId == projectId,
            includeProperties: "Issues",
            orderBy: q => q.OrderByDescending(s => s.CreatedAt));

        var dtos = sprints.Select(s =>
        {
            var dto = _mapper.Map<SprintDto>(s);
            dto.IssueCount = s.Issues.Count;
            dto.CompletedIssueCount = s.Issues.Count(i => i.Status == IssueStatus.Done);
            dto.TotalStoryPoints = s.Issues.Sum(i => i.StoryPoints ?? 0);
            dto.CompletedStoryPoints = s.Issues.Where(i => i.Status == IssueStatus.Done).Sum(i => i.StoryPoints ?? 0);
            return dto;
        }).ToList();

        return new SuccessDataResult<List<SprintDto>>(dtos);
    }

    public async Task<IDataResult<SprintDetailDto>> GetSprintByIdAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _unitOfWork.Sprints.GetAsync(
            s => s.Id == sprintId && s.Project.Members.Any(m => m.UserId == userId),
            includeProperties: "Project,Issues.Reporter,Issues.Assignee,Issues.Comments,Issues.Attachments");

        if (sprint == null)
        {
            throw new NotFoundException(Messages.SprintNotFound);
        }

        var dto = _mapper.Map<SprintDetailDto>(sprint);
        dto.TotalStoryPoints = sprint.Issues.Sum(i => i.StoryPoints ?? 0);
        dto.CompletedStoryPoints = sprint.Issues.Where(i => i.Status == IssueStatus.Done).Sum(i => i.StoryPoints ?? 0);

        return new SuccessDataResult<SprintDetailDto>(dto);
    }

    public async Task<IDataResult<SprintDto>> CreateSprintAsync(Guid projectId, Guid userId, SprintCreateDto request)
    {
        var isMember = await _unitOfWork.ProjectMembers.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var sprint = new Sprint
        {
            ProjectId = projectId,
            Name = request.Name.Trim(),
            Goal = request.Goal?.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = SprintStatus.Planned
        };

        await _unitOfWork.Sprints.AddAsync(sprint);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<SprintDto>(sprint);
        await _activityLogService.LogActivityAsync(userId, "CREATE", "Sprint", sprint.Id, $"Created sprint {sprint.Name}", projectId);

        return new SuccessDataResult<SprintDto>(dto, Messages.SprintCreated);
    }

    public async Task<IDataResult<SprintDto>> UpdateSprintAsync(Guid sprintId, Guid userId, SprintUpdateDto request)
    {
        var sprint = await _unitOfWork.Sprints.GetAsync(
            s => s.Id == sprintId && s.Project.Members.Any(m => m.UserId == userId),
            includeProperties: "Issues");

        if (sprint == null)
        {
            throw new NotFoundException(Messages.SprintNotFound);
        }

        sprint.Name = request.Name.Trim();
        sprint.Goal = request.Goal?.Trim();
        sprint.StartDate = request.StartDate;
        sprint.EndDate = request.EndDate;
        if (request.Status.HasValue)
        {
            sprint.Status = request.Status.Value;
        }
        sprint.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Sprints.Update(sprint);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<SprintDto>(sprint);
        dto.IssueCount = sprint.Issues.Count;
        dto.CompletedIssueCount = sprint.Issues.Count(i => i.Status == IssueStatus.Done);
        dto.TotalStoryPoints = sprint.Issues.Sum(i => i.StoryPoints ?? 0);
        dto.CompletedStoryPoints = sprint.Issues.Where(i => i.Status == IssueStatus.Done).Sum(i => i.StoryPoints ?? 0);

        await _activityLogService.LogActivityAsync(userId, "UPDATE", "Sprint", sprint.Id, $"Updated sprint {sprint.Name}", sprint.ProjectId);

        return new SuccessDataResult<SprintDto>(dto, Messages.SprintUpdated);
    }

    public async Task<IDataResult<SprintDto>> StartSprintAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _unitOfWork.Sprints.GetAsync(
            s => s.Id == sprintId && s.Project.Members.Any(m => m.UserId == userId),
            includeProperties: "Issues");

        if (sprint == null)
        {
            throw new NotFoundException(Messages.SprintNotFound);
        }

        var hasActiveSprint = await _unitOfWork.Sprints.ExistsAsync(
            s => s.ProjectId == sprint.ProjectId && s.Status == SprintStatus.Active && s.Id != sprintId);

        if (hasActiveSprint)
        {
            throw new ValidationException(Messages.SprintAlreadyActive);
        }

        sprint.Status = SprintStatus.Active;
        sprint.StartDate ??= DateTime.UtcNow;
        sprint.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Sprints.Update(sprint);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<SprintDto>(sprint);
        dto.IssueCount = sprint.Issues.Count;
        dto.CompletedIssueCount = sprint.Issues.Count(i => i.Status == IssueStatus.Done);
        dto.TotalStoryPoints = sprint.Issues.Sum(i => i.StoryPoints ?? 0);
        dto.CompletedStoryPoints = sprint.Issues.Where(i => i.Status == IssueStatus.Done).Sum(i => i.StoryPoints ?? 0);

        await _activityLogService.LogActivityAsync(userId, "START", "Sprint", sprint.Id, $"Started sprint {sprint.Name}", sprint.ProjectId);

        return new SuccessDataResult<SprintDto>(dto, Messages.SprintUpdated);
    }

    public async Task<IDataResult<SprintDto>> CompleteSprintAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _unitOfWork.Sprints.GetAsync(
            s => s.Id == sprintId && s.Project.Members.Any(m => m.UserId == userId),
            includeProperties: "Issues");

        if (sprint == null)
        {
            throw new NotFoundException(Messages.SprintNotFound);
        }

        sprint.Status = SprintStatus.Completed;
        sprint.EndDate ??= DateTime.UtcNow;
        sprint.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Sprints.Update(sprint);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<SprintDto>(sprint);
        dto.IssueCount = sprint.Issues.Count;
        dto.CompletedIssueCount = sprint.Issues.Count(i => i.Status == IssueStatus.Done);
        dto.TotalStoryPoints = sprint.Issues.Sum(i => i.StoryPoints ?? 0);
        dto.CompletedStoryPoints = sprint.Issues.Where(i => i.Status == IssueStatus.Done).Sum(i => i.StoryPoints ?? 0);

        await _activityLogService.LogActivityAsync(userId, "COMPLETE", "Sprint", sprint.Id, $"Completed sprint {sprint.Name}", sprint.ProjectId);

        return new SuccessDataResult<SprintDto>(dto, Messages.SprintUpdated);
    }

    public async Task<IResult> DeleteSprintAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _unitOfWork.Sprints.GetAsync(
            s => s.Id == sprintId && s.Project.Members.Any(m => m.UserId == userId));

        if (sprint == null)
        {
            throw new NotFoundException(Messages.SprintNotFound);
        }

        _unitOfWork.Sprints.Delete(sprint);
        await _unitOfWork.SaveChangesAsync();

        await _activityLogService.LogActivityAsync(userId, "DELETE", "Sprint", sprint.Id, $"Deleted sprint {sprint.Name}", sprint.ProjectId);

        return new SuccessResult(Messages.SprintDeleted);
    }
}

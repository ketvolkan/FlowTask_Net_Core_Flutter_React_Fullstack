using AutoMapper;
using Flowtask.Business.DTOs.Sprints;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class SprintService : ISprintService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;

    public SprintService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IActivityLogService activityLogService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<SprintDetailDto>> GetByIdAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<SprintDetailDto>("You do not have access to this project.");
        }

        var sprint = await _unitOfWork.Sprints.Query()
            .Include(s => s.Issues)
                .ThenInclude(i => i.Reporter)
            .Include(s => s.Issues)
                .ThenInclude(i => i.Assignee)
            .FirstOrDefaultAsync(s => s.Id == sprintId && s.ProjectId == projectId, cancellationToken);

        if (sprint == null)
        {
            return new ErrorDataResult<SprintDetailDto>("Sprint not found.");
        }

        var dto = _mapper.Map<SprintDetailDto>(sprint);
        return new SuccessDataResult<SprintDetailDto>(dto);
    }

    public async Task<IDataResult<IReadOnlyList<SprintDto>>> GetProjectSprintsAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IReadOnlyList<SprintDto>>("You do not have access to this project.");
        }

        var sprints = await _unitOfWork.Sprints.Query()
            .Include(s => s.Issues)
            .Where(s => s.ProjectId == projectId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<SprintDto>>(sprints);
        return new SuccessDataResult<IReadOnlyList<SprintDto>>(dtos);
    }

    public async Task<IDataResult<SprintDto>> CreateAsync(Guid projectId, CreateSprintRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<SprintDto>("You do not have access to create sprints in this project.");
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

        await _unitOfWork.Sprints.AddAsync(sprint, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "SPRINT_CREATED", "Sprint", sprint.Id.ToString(), $"Sprint '{sprint.Name}' created", cancellationToken: cancellationToken);

        var dto = _mapper.Map<SprintDto>(sprint);
        return new SuccessDataResult<SprintDto>(dto, "Sprint created successfully.");
    }

    public async Task<IDataResult<SprintDto>> UpdateAsync(Guid projectId, Guid sprintId, UpdateSprintRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<SprintDto>("You do not have access to update sprints in this project.");
        }

        var sprint = await _unitOfWork.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId && s.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (sprint == null)
        {
            return new ErrorDataResult<SprintDto>("Sprint not found.");
        }

        sprint.Name = request.Name.Trim();
        sprint.Goal = request.Goal?.Trim();
        sprint.StartDate = request.StartDate;
        sprint.EndDate = request.EndDate;

        _unitOfWork.Sprints.Update(sprint);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "SPRINT_UPDATED", "Sprint", sprint.Id.ToString(), $"Sprint '{sprint.Name}' updated", cancellationToken: cancellationToken);

        var dto = _mapper.Map<SprintDto>(sprint);
        return new SuccessDataResult<SprintDto>(dto, "Sprint updated successfully.");
    }

    public async Task<IDataResult<SprintDto>> StartSprintAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<SprintDto>("You do not have access to start sprints in this project.");
        }

        var sprint = await _unitOfWork.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId && s.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (sprint == null)
        {
            return new ErrorDataResult<SprintDto>("Sprint not found.");
        }

        sprint.Status = SprintStatus.Active;
        sprint.StartDate ??= DateTime.UtcNow;

        _unitOfWork.Sprints.Update(sprint);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "SPRINT_STARTED", "Sprint", sprint.Id.ToString(), $"Sprint '{sprint.Name}' started", cancellationToken: cancellationToken);

        var dto = _mapper.Map<SprintDto>(sprint);
        return new SuccessDataResult<SprintDto>(dto, "Sprint started successfully.");
    }

    public async Task<IDataResult<SprintDto>> CompleteSprintAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<SprintDto>("You do not have access to complete sprints in this project.");
        }

        var sprint = await _unitOfWork.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId && s.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (sprint == null)
        {
            return new ErrorDataResult<SprintDto>("Sprint not found.");
        }

        sprint.Status = SprintStatus.Completed;
        sprint.EndDate = DateTime.UtcNow;

        _unitOfWork.Sprints.Update(sprint);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "SPRINT_COMPLETED", "Sprint", sprint.Id.ToString(), $"Sprint '{sprint.Name}' completed", cancellationToken: cancellationToken);

        var dto = _mapper.Map<SprintDto>(sprint);
        return new SuccessDataResult<SprintDto>(dto, "Sprint completed successfully.");
    }

    public async Task<IResult> DeleteAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorResult("You do not have access to delete sprints in this project.");
        }

        var sprint = await _unitOfWork.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId && s.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (sprint == null)
        {
            return new ErrorResult("Sprint not found.");
        }

        _unitOfWork.Sprints.Delete(sprint);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "SPRINT_DELETED", "Sprint", sprint.Id.ToString(), $"Sprint '{sprint.Name}' deleted", cancellationToken: cancellationToken);

        return new SuccessResult("Sprint deleted successfully.");
    }

    private async Task<bool> HasProjectAccessAsync(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        return await _unitOfWork.Projects.AnyAsync(p => p.Id == projectId && (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)), cancellationToken);
    }
}

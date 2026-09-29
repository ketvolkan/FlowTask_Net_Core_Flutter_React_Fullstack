using AutoMapper;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Caching;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;
    private readonly IActivityLogService _activityLogService;

    public ProjectService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICacheService cacheService,
        IActivityLogService activityLogService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _cacheService = cacheService;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<ProjectDetailDto>> GetByIdAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<ProjectDetailDto>("You do not have access to this project.");
        }

        var project = await _unitOfWork.Projects.Query()
            .Include(p => p.Owner)
            .Include(p => p.Members)
                .ThenInclude(m => m.User)
            .Include(p => p.Issues)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return new ErrorDataResult<ProjectDetailDto>("Project not found.");
        }

        var dto = _mapper.Map<ProjectDetailDto>(project);
        return new SuccessDataResult<ProjectDetailDto>(dto);
    }

    public async Task<PagedDataResult<ProjectDto>> GetUserProjectsAsync(Guid currentUserId, PaginationParams paginationParams, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Projects.Query()
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Issues)
            .AsQueryable();

        if (!isSystemAdmin)
        {
            query = query.Where(p => p.OwnerId == currentUserId || p.Members.Any(m => m.UserId == currentUserId));
        }

        if (!string.IsNullOrWhiteSpace(paginationParams.Search))
        {
            var search = paginationParams.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search) || p.Key.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = paginationParams.IsAscending
            ? query.OrderBy(p => p.Name)
            : query.OrderByDescending(p => p.CreatedAt);

        var projects = await query
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ProjectDto>>(projects);

        return new PagedDataResult<ProjectDto>(dtos, totalCount, paginationParams.Page, paginationParams.PageSize, "Projects retrieved successfully.");
    }

    public async Task<IDataResult<ProjectDto>> CreateAsync(CreateProjectRequest request, Guid currentUserId, CancellationToken cancellationToken = default)
    {
        var keyUpper = request.Key.Trim().ToUpperInvariant();
        var exists = await _unitOfWork.Projects.AnyAsync(p => p.Key == keyUpper, cancellationToken);
        if (exists)
        {
            return new ErrorDataResult<ProjectDto>($"Project with key '{keyUpper}' already exists.");
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Key = keyUpper,
            Description = request.Description?.Trim(),
            AvatarUrl = request.AvatarUrl,
            OwnerId = currentUserId
        };

        await _unitOfWork.Projects.AddAsync(project, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add creator as ProjectAdmin member automatically
        var member = new ProjectMember
        {
            ProjectId = project.Id,
            UserId = currentUserId,
            Role = ProjectRoleType.ProjectAdmin
        };
        await _unitOfWork.ProjectMembers.AddAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, project.Id, "PROJECT_CREATED", "Project", project.Id.ToString(), $"Project '{project.Name}' ({project.Key}) created", cancellationToken: cancellationToken);

        var createdProject = await _unitOfWork.Projects.Query()
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Issues)
            .FirstOrDefaultAsync(p => p.Id == project.Id, cancellationToken);

        var dto = _mapper.Map<ProjectDto>(createdProject);
        return new SuccessDataResult<ProjectDto>(dto, "Project created successfully.");
    }

    public async Task<IDataResult<ProjectDto>> UpdateAsync(Guid projectId, UpdateProjectRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorDataResult<ProjectDto>("Project not found.");
        }

        if (!isSystemAdmin && !await IsProjectAdminAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<ProjectDto>("Only Project Admins can update project settings.");
        }

        project.Name = request.Name.Trim();
        project.Description = request.Description?.Trim();
        project.AvatarUrl = request.AvatarUrl ?? project.AvatarUrl;
        project.IsArchived = request.IsArchived;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMeta(projectId), cancellationToken);
        await _activityLogService.LogAsync(currentUserId, projectId, "PROJECT_UPDATED", "Project", projectId.ToString(), $"Project '{project.Name}' updated", cancellationToken: cancellationToken);

        var updatedProject = await _unitOfWork.Projects.Query()
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Issues)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        var dto = _mapper.Map<ProjectDto>(updatedProject);
        return new SuccessDataResult<ProjectDto>(dto, "Project updated successfully.");
    }

    public async Task<IResult> DeleteAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorResult("Project not found.");
        }

        if (!isSystemAdmin && project.OwnerId != currentUserId)
        {
            return new ErrorResult("Only the project owner or a System Admin can delete this project.");
        }

        await _unitOfWork.Projects.SoftDeleteAsync(projectId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMeta(projectId), cancellationToken);
        await _activityLogService.LogAsync(currentUserId, projectId, "PROJECT_DELETED", "Project", projectId.ToString(), $"Project '{project.Name}' deleted", cancellationToken: cancellationToken);

        return new SuccessResult("Project deleted successfully.");
    }

    public async Task<IResult> ArchiveAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorResult("Project not found.");
        }

        if (!isSystemAdmin && !await IsProjectAdminAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorResult("Only Project Admins can archive this project.");
        }

        project.IsArchived = !project.IsArchived;
        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMeta(projectId), cancellationToken);
        await _activityLogService.LogAsync(currentUserId, projectId, project.IsArchived ? "PROJECT_ARCHIVED" : "PROJECT_UNARCHIVED", "Project", projectId.ToString(), $"Project archive status toggled to {project.IsArchived}", cancellationToken: cancellationToken);

        return new SuccessResult(project.IsArchived ? "Project archived successfully." : "Project unarchived successfully.");
    }

    public async Task<bool> HasProjectAccessAsync(Guid projectId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Projects.AnyAsync(p => p.Id == projectId && (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)), cancellationToken);
    }

    private async Task<bool> IsProjectAdminAsync(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken: cancellationToken);
        if (project == null) return false;
        if (project.OwnerId == userId) return true;

        return await _unitOfWork.ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == userId && m.Role == ProjectRoleType.ProjectAdmin, cancellationToken);
    }
}

using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Projects;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Concrete;

public class ProjectManager : IProjectService
{
    private readonly IProjectDal _projectDal;
    private readonly IProjectMemberDal _projectMemberDal;
    private readonly IUserDal _userDal;
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;

    public ProjectManager(
        IProjectDal projectDal,
        IProjectMemberDal projectMemberDal,
        IUserDal userDal,
        IMapper mapper,
        IActivityLogService activityLogService)
    {
        _projectDal = projectDal;
        _projectMemberDal = projectMemberDal;
        _userDal = userDal;
        _mapper = mapper;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<PagedDataResult<ProjectDto>>> GetUserProjectsAsync(Guid userId, PaginationParams pagination)
    {
        var (projects, totalCount) = await _projectDal.GetPagedAsync(
            filter: p => p.Members.Any(m => m.UserId == userId),
            page: pagination.Page,
            pageSize: pagination.PageSize,
            includeProperties: "Owner,Members,Issues",
            orderBy: q => q.OrderByDescending(p => p.CreatedAt));

        var dtos = projects.Select(p =>
        {
            var dto = _mapper.Map<ProjectDto>(p);
            dto.MemberCount = p.Members.Count;
            dto.IssueCount = p.Issues.Count(i => !i.IsDeleted);
            return dto;
        }).ToList();

        var pagedResult = PagedDataResult<ProjectDto>.Create(dtos, totalCount, pagination.Page, pagination.PageSize);
        return new SuccessDataResult<PagedDataResult<ProjectDto>>(pagedResult);
    }

    public async Task<IDataResult<ProjectDetailDto>> GetProjectByIdAsync(Guid projectId, Guid userId)
    {
        var project = await _projectDal.GetAsync(
            p => p.Id == projectId && p.Members.Any(m => m.UserId == userId),
            includeProperties: "Owner,Members.User,Issues");

        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        var dto = _mapper.Map<ProjectDetailDto>(project);
        dto.TotalIssues = project.Issues.Count(i => !i.IsDeleted);
        dto.OpenIssues = project.Issues.Count(i => !i.IsDeleted && i.Status != IssueStatus.Done);
        dto.DoneIssues = project.Issues.Count(i => !i.IsDeleted && i.Status == IssueStatus.Done);

        return new SuccessDataResult<ProjectDetailDto>(dto);
    }

    public async Task<IDataResult<ProjectDto>> CreateProjectAsync(Guid userId, ProjectCreateDto request)
    {
        var existingKey = await _projectDal.GetAsync(p => p.Key.ToUpper() == request.Key.Trim().ToUpper());
        if (existingKey != null)
        {
            throw new ConflictException(Messages.ProjectKeyExists);
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Key = request.Key.Trim().ToUpper(),
            Description = request.Description?.Trim(),
            AvatarUrl = request.AvatarUrl,
            OwnerId = userId
        };

        project.Members.Add(new ProjectMember
        {
            UserId = userId,
            Role = ProjectRoleType.Owner
        });

        await _projectDal.AddAsync(project);

        var user = await _userDal.GetByIdAsync(userId);
        project.Owner = user!;

        var dto = _mapper.Map<ProjectDto>(project);
        dto.MemberCount = 1;
        dto.IssueCount = 0;

        await _activityLogService.LogActivityAsync(userId, "CREATE", "Project", project.Id, $"Created project {project.Name} ({project.Key})", project.Id);

        return new SuccessDataResult<ProjectDto>(dto, Messages.ProjectCreated);
    }

    public async Task<IDataResult<ProjectDto>> UpdateProjectAsync(Guid projectId, Guid userId, ProjectUpdateDto request)
    {
        var project = await _projectDal.GetAsync(
            p => p.Id == projectId,
            includeProperties: "Owner,Members,Issues");

        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        var member = project.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null || (member.Role != ProjectRoleType.Owner && member.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        project.Name = request.Name.Trim();
        project.Description = request.Description?.Trim();
        project.AvatarUrl = request.AvatarUrl;
        project.OwnerId = request.OwnerId;
        project.IsArchived = request.IsArchived;
        project.UpdatedAt = DateTime.UtcNow;

        await _projectDal.UpdateAsync(project);

        var updated = await _projectDal.GetAsync(
            p => p.Id == projectId,
            includeProperties: "Owner,Members,Issues");

        var dto = _mapper.Map<ProjectDto>(updated);
        dto.MemberCount = updated!.Members.Count;
        dto.IssueCount = updated.Issues.Count(i => !i.IsDeleted);

        await _activityLogService.LogActivityAsync(userId, "UPDATE", "Project", project.Id, $"Updated project {project.Name}", project.Id);

        return new SuccessDataResult<ProjectDto>(dto, Messages.ProjectUpdated);
    }

    public async Task<IResult> DeleteProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _projectDal.GetAsync(
            p => p.Id == projectId,
            includeProperties: "Members");

        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        var member = project.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null || member.Role != ProjectRoleType.Owner)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        await _projectDal.DeleteAsync(project);

        await _activityLogService.LogActivityAsync(userId, "DELETE", "Project", project.Id, $"Deleted project {project.Name}", project.Id);

        return new SuccessResult(Messages.ProjectDeleted);
    }
}

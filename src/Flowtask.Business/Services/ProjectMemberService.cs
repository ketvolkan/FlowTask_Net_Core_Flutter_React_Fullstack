using AutoMapper;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Caching;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class ProjectMemberService : IProjectMemberService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;
    private readonly IActivityLogService _activityLogService;
    private readonly INotificationService _notificationService;

    public ProjectMemberService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICacheService cacheService,
        IActivityLogService activityLogService,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _cacheService = cacheService;
        _activityLogService = activityLogService;
        _notificationService = notificationService;
    }

    public async Task<IDataResult<IReadOnlyList<ProjectMemberDto>>> GetMembersAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorDataResult<IReadOnlyList<ProjectMemberDto>>("Project not found.");
        }

        if (!isSystemAdmin)
        {
            var isMember = await _unitOfWork.ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == currentUserId, cancellationToken);
            if (!isMember && project.OwnerId != currentUserId)
            {
                return new ErrorDataResult<IReadOnlyList<ProjectMemberDto>>("You do not have access to view members of this project.");
            }
        }

        var members = await _unitOfWork.ProjectMembers.Query()
            .Include(m => m.User)
            .Where(m => m.ProjectId == projectId)
            .OrderBy(m => m.JoinedAt)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ProjectMemberDto>>(members);
        return new SuccessDataResult<IReadOnlyList<ProjectMemberDto>>(dtos);
    }

    public async Task<IDataResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, AddProjectMemberRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorDataResult<ProjectMemberDto>("Project not found.");
        }

        if (!isSystemAdmin && !await IsProjectAdminAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<ProjectMemberDto>("Only Project Admins can add members to this project.");
        }

        var targetUser = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (targetUser == null)
        {
            return new ErrorDataResult<ProjectMemberDto>("User not found.");
        }

        var alreadyMember = await _unitOfWork.ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == request.UserId, cancellationToken);
        if (alreadyMember)
        {
            return new ErrorDataResult<ProjectMemberDto>("User is already a member of this project.");
        }

        var newMember = new ProjectMember
        {
            ProjectId = projectId,
            UserId = request.UserId,
            Role = request.Role,
            JoinedAt = DateTime.UtcNow
        };

        await _unitOfWork.ProjectMembers.AddAsync(newMember, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMembers(projectId), cancellationToken);
        await _activityLogService.LogAsync(currentUserId, projectId, "MEMBER_ADDED", "ProjectMember", newMember.Id.ToString(), $"User '{targetUser.FullName}' added with role '{request.Role}'", cancellationToken: cancellationToken);

        await _notificationService.SendNotificationAsync(
            targetUser.Id,
            NotificationType.ProjectInvited,
            "Added to Project",
            $"You have been added to project '{project.Name}' as a {request.Role}.",
            $"/app/projects/{projectId}",
            cancellationToken);

        var memberWithUser = await _unitOfWork.ProjectMembers.Query()
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == newMember.Id, cancellationToken);

        var dto = _mapper.Map<ProjectMemberDto>(memberWithUser);
        return new SuccessDataResult<ProjectMemberDto>(dto, "Member added successfully.");
    }

    public async Task<IDataResult<ProjectMemberDto>> UpdateMemberRoleAsync(Guid projectId, Guid targetUserId, UpdateMemberRoleRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await IsProjectAdminAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<ProjectMemberDto>("Only Project Admins can update member roles.");
        }

        var member = await _unitOfWork.ProjectMembers.Query(asNoTracking: false)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == targetUserId, cancellationToken);

        if (member == null)
        {
            return new ErrorDataResult<ProjectMemberDto>("Project member not found.");
        }

        member.Role = request.Role;
        _unitOfWork.ProjectMembers.Update(member);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMembers(projectId), cancellationToken);
        await _activityLogService.LogAsync(currentUserId, projectId, "MEMBER_ROLE_UPDATED", "ProjectMember", member.Id.ToString(), $"User '{member.User.FullName}' role updated to '{request.Role}'", cancellationToken: cancellationToken);

        var dto = _mapper.Map<ProjectMemberDto>(member);
        return new SuccessDataResult<ProjectMemberDto>(dto, "Member role updated successfully.");
    }

    public async Task<IResult> RemoveMemberAsync(Guid projectId, Guid targetUserId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorResult("Project not found.");
        }

        if (project.OwnerId == targetUserId)
        {
            return new ErrorResult("Project owner cannot be removed from the project.");
        }

        if (!isSystemAdmin && !await IsProjectAdminAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorResult("Only Project Admins can remove members from this project.");
        }

        var member = await _unitOfWork.ProjectMembers.FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == targetUserId, asNoTracking: false, cancellationToken: cancellationToken);
        if (member == null)
        {
            return new ErrorResult("Project member not found.");
        }

        _unitOfWork.ProjectMembers.Delete(member);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMembers(projectId), cancellationToken);
        await _activityLogService.LogAsync(currentUserId, projectId, "MEMBER_REMOVED", "ProjectMember", member.Id.ToString(), $"Member removed from project", cancellationToken: cancellationToken);

        return new SuccessResult("Member removed successfully.");
    }

    private async Task<bool> IsProjectAdminAsync(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken: cancellationToken);
        if (project == null) return false;
        if (project.OwnerId == userId) return true;

        return await _unitOfWork.ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == userId && m.Role == ProjectRoleType.ProjectAdmin, cancellationToken);
    }
}

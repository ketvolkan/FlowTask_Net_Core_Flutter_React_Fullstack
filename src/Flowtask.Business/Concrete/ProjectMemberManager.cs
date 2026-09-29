using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Projects;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Concrete;

public class ProjectMemberManager : IProjectMemberService
{
    private readonly IProjectMemberDal _projectMemberDal;
    private readonly IUserDal _userDal;
    private readonly IMapper _mapper;

    public ProjectMemberManager(IProjectMemberDal projectMemberDal, IUserDal userDal, IMapper mapper)
    {
        _projectMemberDal = projectMemberDal;
        _userDal = userDal;
        _mapper = mapper;
    }

    public async Task<IDataResult<List<ProjectMemberDto>>> GetProjectMembersAsync(Guid projectId, Guid userId)
    {
        var isMember = await _projectMemberDal.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var members = await _projectMemberDal.GetListAsync(
            filter: pm => pm.ProjectId == projectId,
            includeProperties: "User",
            orderBy: q => q.OrderBy(pm => pm.JoinedAt));

        var dtos = _mapper.Map<List<ProjectMemberDto>>(members);
        return new SuccessDataResult<List<ProjectMemberDto>>(dtos);
    }

    public async Task<IDataResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, Guid currentUserId, AddProjectMemberDto request)
    {
        var currentMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        if (currentMember == null || (currentMember.Role != ProjectRoleType.Owner && currentMember.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        User? user = null;
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            user = await _userDal.GetAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user == null)
            {
                throw new NotFoundException($"User with email '{request.Email.Trim()}' was not found.");
            }
        }
        else if (request.UserId.HasValue && request.UserId.Value != Guid.Empty)
        {
            user = await _userDal.GetByIdAsync(request.UserId.Value);
            if (user == null)
            {
                throw new NotFoundException(Messages.UserNotFound);
            }
        }
        else
        {
            throw new ValidationException("User email is required to add member.");
        }

        var existingMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == user.Id);

        if (existingMember != null)
        {
            throw new ConflictException(Messages.MemberAlreadyExists);
        }

        var projectMember = new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = request.Role
        };

        await _projectMemberDal.AddAsync(projectMember);

        projectMember.User = user;
        var dto = _mapper.Map<ProjectMemberDto>(projectMember);
        return new SuccessDataResult<ProjectMemberDto>(dto, Messages.ProjectMemberAdded);
    }

    public async Task<IDataResult<ProjectMemberDto>> UpdateMemberRoleAsync(Guid projectId, Guid targetUserId, Guid currentUserId, UpdateMemberRoleDto request)
    {
        var currentMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        if (currentMember == null || (currentMember.Role != ProjectRoleType.Owner && currentMember.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var targetMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == targetUserId,
            includeProperties: "User");

        if (targetMember == null)
        {
            throw new NotFoundException(Messages.MemberNotFound);
        }

        targetMember.Role = request.Role;
        await _projectMemberDal.UpdateAsync(targetMember);

        var dto = _mapper.Map<ProjectMemberDto>(targetMember);
        return new SuccessDataResult<ProjectMemberDto>(dto, Messages.ProjectMemberUpdated);
    }

    public async Task<IResult> RemoveMemberAsync(Guid projectId, Guid targetUserId, Guid currentUserId)
    {
        var currentMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        if (currentMember == null || (currentMember.Role != ProjectRoleType.Owner && currentMember.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var targetMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == targetUserId);

        if (targetMember == null)
        {
            throw new NotFoundException(Messages.MemberNotFound);
        }

        if (targetMember.Role == ProjectRoleType.Owner)
        {
            throw new ValidationException(Messages.AuthorizationDenied);
        }

        await _projectMemberDal.DeleteAsync(targetMember);

        return new SuccessResult(Messages.ProjectMemberRemoved);
    }
}

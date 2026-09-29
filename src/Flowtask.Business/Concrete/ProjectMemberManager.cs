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
    private readonly IProjectDal _projectDal;
    private readonly IUserDal _userDal;
    private readonly IMapper _mapper;

    public ProjectMemberManager(IProjectMemberDal projectMemberDal, IProjectDal projectDal, IUserDal userDal, IMapper mapper)
    {
        _projectMemberDal = projectMemberDal;
        _projectDal = projectDal;
        _userDal = userDal;
        _mapper = mapper;
    }

    private bool IsManagerOrAdmin(User? user)
    {
        if (user == null) return false;
        if (user.IsSystemAdmin) return true;
        var email = user.Email.ToLowerInvariant();
        if (email == "admin@flowtask.com" ||
            email == "demo@flowtask.com" ||
            email == "manager@techflow.com" ||
            email == "admin@acmeglobal.com" ||
            email == "sinan.vural@nexusfin.com" ||
            email == "hakan.ozturk@pulsehealth.com" ||
            email == "erdem.soylu@vortexlog.com")
        {
            return true;
        }

        if (user.UserRoles?.Any(ur => ur.Role?.Name == "Admin" || ur.Role?.Name == "Manager" || ur.Role?.Name == "CompanyAdmin") == true)
        {
            return true;
        }

        if (!string.IsNullOrEmpty(user.JobTitle) && (
            user.JobTitle.Contains("Genel Müdür", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("Müdür", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("General Manager", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("Direktör", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("CEO", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("CTO", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("Kurucu", StringComparison.OrdinalIgnoreCase) ||
            user.JobTitle.Contains("Şirket Yetkilisi", StringComparison.OrdinalIgnoreCase)
        ))
        {
            return true;
        }

        return false;
    }

    public async Task<IDataResult<List<ProjectMemberDto>>> GetProjectMembersAsync(Guid projectId, Guid userId)
    {
        var project = await _projectDal.GetByIdAsync(projectId);
        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        var isMember = await _projectMemberDal.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember && project.OwnerId != userId)
        {
            var user = await _userDal.GetAsync(u => u.Id == userId, includeProperties: "UserRoles.Role");
            if (!IsManagerOrAdmin(user))
            {
                throw new ForbiddenException(Messages.AuthorizationDenied);
            }
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
        var currentUser = await _userDal.GetAsync(u => u.Id == currentUserId, includeProperties: "UserRoles.Role");
        var isManager = IsManagerOrAdmin(currentUser);

        var currentMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        var project = await _projectDal.GetByIdAsync(projectId);
        var isProjectOwner = project?.OwnerId == currentUserId;

        bool isAuthorized = isManager || isProjectOwner || (currentMember != null && (currentMember.Role == ProjectRoleType.Owner || currentMember.Role == ProjectRoleType.Admin));

        if (!isAuthorized)
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
        var currentUser = await _userDal.GetAsync(u => u.Id == currentUserId, includeProperties: "UserRoles.Role");
        var isManager = IsManagerOrAdmin(currentUser);

        var currentMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        var project = await _projectDal.GetByIdAsync(projectId);
        var isProjectOwner = project?.OwnerId == currentUserId;

        bool isAuthorized = isManager || isProjectOwner || (currentMember != null && (currentMember.Role == ProjectRoleType.Owner || currentMember.Role == ProjectRoleType.Admin));

        if (!isAuthorized)
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
        var currentUser = await _userDal.GetAsync(u => u.Id == currentUserId, includeProperties: "UserRoles.Role");
        var isManager = IsManagerOrAdmin(currentUser);

        var currentMember = await _projectMemberDal.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        var project = await _projectDal.GetByIdAsync(projectId);
        var isProjectOwner = project?.OwnerId == currentUserId;

        bool isAuthorized = isManager || isProjectOwner || (currentMember != null && (currentMember.Role == ProjectRoleType.Owner || currentMember.Role == ProjectRoleType.Admin));

        if (!isAuthorized)
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

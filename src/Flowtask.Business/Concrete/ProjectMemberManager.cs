using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.Projects;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Concrete;

public class ProjectMemberManager : IProjectMemberService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProjectMemberManager(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IDataResult<List<ProjectMemberDto>>> GetProjectMembersAsync(Guid projectId, Guid userId)
    {
        var isMember = await _unitOfWork.ProjectMembers.ExistsAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (!isMember)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var members = await _unitOfWork.ProjectMembers.GetAllAsync(
            filter: pm => pm.ProjectId == projectId,
            includeProperties: "User",
            orderBy: q => q.OrderBy(pm => pm.JoinedAt));

        var dtos = _mapper.Map<List<ProjectMemberDto>>(members);
        return new SuccessDataResult<List<ProjectMemberDto>>(dtos);
    }

    public async Task<IDataResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, Guid currentUserId, AddProjectMemberDto request)
    {
        var currentMember = await _unitOfWork.ProjectMembers.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        if (currentMember == null || (currentMember.Role != ProjectRoleType.Owner && currentMember.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var existingMember = await _unitOfWork.ProjectMembers.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == request.UserId);

        if (existingMember != null)
        {
            throw new ConflictException(Messages.MemberAlreadyExists);
        }

        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        var projectMember = new ProjectMember
        {
            ProjectId = projectId,
            UserId = request.UserId,
            Role = request.Role
        };

        await _unitOfWork.ProjectMembers.AddAsync(projectMember);
        await _unitOfWork.SaveChangesAsync();

        projectMember.User = user;
        var dto = _mapper.Map<ProjectMemberDto>(projectMember);
        return new SuccessDataResult<ProjectMemberDto>(dto, Messages.ProjectMemberAdded);
    }

    public async Task<IDataResult<ProjectMemberDto>> UpdateMemberRoleAsync(Guid projectId, Guid targetUserId, Guid currentUserId, UpdateMemberRoleDto request)
    {
        var currentMember = await _unitOfWork.ProjectMembers.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        if (currentMember == null || (currentMember.Role != ProjectRoleType.Owner && currentMember.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var targetMember = await _unitOfWork.ProjectMembers.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == targetUserId,
            includeProperties: "User");

        if (targetMember == null)
        {
            throw new NotFoundException(Messages.MemberNotFound);
        }

        targetMember.Role = request.Role;
        _unitOfWork.ProjectMembers.Update(targetMember);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<ProjectMemberDto>(targetMember);
        return new SuccessDataResult<ProjectMemberDto>(dto, Messages.ProjectMemberUpdated);
    }

    public async Task<IResult> RemoveMemberAsync(Guid projectId, Guid targetUserId, Guid currentUserId)
    {
        var currentMember = await _unitOfWork.ProjectMembers.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == currentUserId);

        if (currentMember == null || (currentMember.Role != ProjectRoleType.Owner && currentMember.Role != ProjectRoleType.Admin))
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var targetMember = await _unitOfWork.ProjectMembers.GetAsync(
            pm => pm.ProjectId == projectId && pm.UserId == targetUserId);

        if (targetMember == null)
        {
            throw new NotFoundException(Messages.MemberNotFound);
        }

        if (targetMember.Role == ProjectRoleType.Owner)
        {
            throw new ValidationException(Messages.AuthorizationDenied);
        }

        _unitOfWork.ProjectMembers.Delete(targetMember);
        await _unitOfWork.SaveChangesAsync();

        return new SuccessResult(Messages.ProjectMemberRemoved);
    }
}

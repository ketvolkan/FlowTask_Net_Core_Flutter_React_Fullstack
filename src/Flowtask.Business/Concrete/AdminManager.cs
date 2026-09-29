using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.Admin;
using Flowtask.EntityLayer.DTOs.Projects;
using Flowtask.EntityLayer.DTOs.Users;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Concrete;

public class AdminManager : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public AdminManager(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<IDataResult<SystemStatisticsDto>> GetSystemStatisticsAsync()
    {
        var totalUsers = await _unitOfWork.Users.CountAsync();
        var activeUsers = await _unitOfWork.Users.CountAsync(u => u.IsActive);
        var totalProjects = await _unitOfWork.Projects.CountAsync();
        var totalIssues = await _unitOfWork.Issues.CountAsync();
        var completedIssues = await _unitOfWork.Issues.CountAsync(i => i.Status == IssueStatus.Done);
        var totalSprints = await _unitOfWork.Sprints.CountAsync();
        var activeSprints = await _unitOfWork.Sprints.CountAsync(s => s.Status == SprintStatus.Active);

        var stats = new SystemStatisticsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalProjects = totalProjects,
            TotalIssues = totalIssues,
            CompletedIssues = completedIssues,
            TotalSprints = totalSprints,
            ActiveSprints = activeSprints
        };

        return new SuccessDataResult<SystemStatisticsDto>(stats);
    }

    public async Task<IDataResult<PagedDataResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination)
    {
        var (users, totalCount) = await _unitOfWork.Users.GetPagedAsync(
            page: pagination.Page,
            pageSize: pagination.PageSize,
            includeProperties: "UserRoles.Role",
            orderBy: q => q.OrderByDescending(u => u.CreatedAt));

        var dtos = users.Select(u =>
        {
            var dto = _mapper.Map<UserDto>(u);
            dto.Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList();
            return dto;
        }).ToList();

        var pagedResult = PagedDataResult<UserDto>.Create(dtos, totalCount, pagination.Page, pagination.PageSize);
        return new SuccessDataResult<PagedDataResult<UserDto>>(pagedResult);
    }

    public async Task<IDataResult<UserDto>> CreateUserAsync(CreateUserAdminDto request)
    {
        var existingUser = await _unitOfWork.Users.GetAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
        if (existingUser != null)
        {
            throw new ConflictException(Messages.UserAlreadyExists);
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            FullName = request.FullName.Trim(),
            JobTitle = request.JobTitle?.Trim(),
            Department = request.Department?.Trim(),
            IsActive = true
        };

        if (request.Roles.Any())
        {
            var allRoles = await _unitOfWork.Roles.GetAllAsync(r => request.Roles.Contains(r.Name));
            foreach (var role in allRoles)
            {
                user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
            }
        }
        else
        {
            var memberRole = await _unitOfWork.Roles.GetAsync(r => r.Name == "Member");
            if (memberRole != null)
            {
                user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = memberRole.Id });
            }
        }

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.Users.GetAsync(u => u.Id == user.Id, includeProperties: "UserRoles.Role");
        var dto = _mapper.Map<UserDto>(created);
        dto.Roles = created!.UserRoles.Select(ur => ur.Role.Name).ToList();

        return new SuccessDataResult<UserDto>(dto, Messages.UserCreated);
    }

    public async Task<IDataResult<UserDto>> UpdateUserAsync(Guid userId, UpdateUserAdminDto request)
    {
        var user = await _unitOfWork.Users.GetAsync(u => u.Id == userId, includeProperties: "UserRoles.Role");
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        user.FullName = request.FullName.Trim();
        user.AvatarUrl = request.AvatarUrl;
        user.JobTitle = request.JobTitle?.Trim();
        user.Department = request.Department?.Trim();
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        user.UserRoles.Clear();
        if (request.Roles.Any())
        {
            var allRoles = await _unitOfWork.Roles.GetAllAsync(r => request.Roles.Contains(r.Name));
            foreach (var role in allRoles)
            {
                user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
            }
        }

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Users.GetAsync(u => u.Id == userId, includeProperties: "UserRoles.Role");
        var dto = _mapper.Map<UserDto>(updated);
        dto.Roles = updated!.UserRoles.Select(ur => ur.Role.Name).ToList();

        return new SuccessDataResult<UserDto>(dto, Messages.UserUpdated);
    }

    public async Task<IResult> DeleteUserAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.SaveChangesAsync();

        return new SuccessResult(Messages.UserDeleted);
    }

    public async Task<IDataResult<PagedDataResult<ProjectDto>>> GetAllProjectsAsync(PaginationParams pagination)
    {
        var (projects, totalCount) = await _unitOfWork.Projects.GetPagedAsync(
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

    public async Task<IResult> DeleteProjectAsync(Guid projectId)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(projectId);
        if (project == null)
        {
            throw new NotFoundException(Messages.ProjectNotFound);
        }

        _unitOfWork.Projects.Delete(project);
        await _unitOfWork.SaveChangesAsync();

        return new SuccessResult(Messages.ProjectDeleted);
    }
}

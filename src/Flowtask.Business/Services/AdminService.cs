using AutoMapper;
using Flowtask.Business.DTOs.Admin;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.DTOs.Users;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Caching;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICacheService _cacheService;
    private readonly IActivityLogService _activityLogService;

    public AdminService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        ICacheService cacheService,
        IActivityLogService activityLogService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _cacheService = cacheService;
        _activityLogService = activityLogService;
    }

    public async Task<PagedDataResult<UserDto>> GetAllUsersAsync(PaginationParams paginationParams, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Users.Query()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(paginationParams.Search))
        {
            var search = paginationParams.Search.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(search) || u.Email.ToLower().Contains(search) || (u.JobTitle != null && u.JobTitle.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = paginationParams.IsAscending
            ? query.OrderBy(u => u.FullName)
            : query.OrderByDescending(u => u.CreatedAt);

        var users = await query
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<UserDto>>(users);
        return new PagedDataResult<UserDto>(dtos, totalCount, paginationParams.Page, paginationParams.PageSize, "Users retrieved successfully.");
    }

    public async Task<IDataResult<UserDto>> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            return new ErrorDataResult<UserDto>("User not found.");
        }

        return new SuccessDataResult<UserDto>(_mapper.Map<UserDto>(user));
    }

    public async Task<IDataResult<UserDto>> CreateUserAsync(CreateUserAdminRequest request, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
        if (exists)
        {
            return new ErrorDataResult<UserDto>("An account with this email address already exists.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            JobTitle = request.JobTitle?.Trim(),
            IsActive = true,
            IsSystemAdmin = request.IsSystemAdmin
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (request.RoleNames.Count > 0)
        {
            foreach (var roleName in request.RoleNames)
            {
                var role = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken: cancellationToken);
                if (role != null)
                {
                    await _unitOfWork.UserRoles.AddAsync(new UserRole { UserId = user.Id, RoleId = role.Id }, cancellationToken);
                }
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await _activityLogService.LogAsync(adminUserId, null, "ADMIN_CREATED_USER", "User", user.Id.ToString(), $"Admin created user {user.Email}", cancellationToken: cancellationToken);

        return await GetUserByIdAsync(user.Id, cancellationToken);
    }

    public async Task<IDataResult<UserDto>> UpdateUserAsync(Guid userId, UpdateUserAdminRequest request, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (user == null)
        {
            return new ErrorDataResult<UserDto>("User not found.");
        }

        user.FullName = request.FullName.Trim();
        user.JobTitle = request.JobTitle?.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.IsActive = request.IsActive;
        user.IsSystemAdmin = request.IsSystemAdmin;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.UserPermissions(userId), cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.UserRoles(userId), cancellationToken);

        await _activityLogService.LogAsync(adminUserId, null, "ADMIN_UPDATED_USER", "User", userId.ToString(), $"Admin updated user {user.Email}", cancellationToken: cancellationToken);

        return await GetUserByIdAsync(userId, cancellationToken);
    }

    public async Task<IResult> ToggleUserStatusAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (user == null)
        {
            return new ErrorResult("User not found.");
        }

        user.IsActive = !user.IsActive;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.UserPermissions(userId), cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.UserRoles(userId), cancellationToken);

        await _activityLogService.LogAsync(adminUserId, null, "ADMIN_TOGGLED_USER_STATUS", "User", userId.ToString(), $"User status changed to {(user.IsActive ? "Active" : "Inactive")}", cancellationToken: cancellationToken);

        return new SuccessResult($"User is now {(user.IsActive ? "active" : "inactive")}.");
    }

    public async Task<IResult> SetSystemAdminRoleAsync(Guid userId, bool isSystemAdmin, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (user == null)
        {
            return new ErrorResult("User not found.");
        }

        user.IsSystemAdmin = isSystemAdmin;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var adminRole = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == "SystemAdmin", cancellationToken: cancellationToken);
        if (adminRole != null)
        {
            var userRole = await _unitOfWork.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == adminRole.Id, asNoTracking: false, cancellationToken: cancellationToken);
            if (isSystemAdmin && userRole == null)
            {
                await _unitOfWork.UserRoles.AddAsync(new UserRole { UserId = userId, RoleId = adminRole.Id }, cancellationToken);
            }
            else if (!isSystemAdmin && userRole != null)
            {
                _unitOfWork.UserRoles.Delete(userRole);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await _cacheService.RemoveAsync(CacheKeys.UserPermissions(userId), cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.UserRoles(userId), cancellationToken);

        await _activityLogService.LogAsync(adminUserId, null, "ADMIN_CHANGED_ROLE", "User", userId.ToString(), $"SystemAdmin status set to {isSystemAdmin}", cancellationToken: cancellationToken);

        return new SuccessResult("User system role updated.");
    }

    public async Task<IResult> DeleteUserAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        if (userId == adminUserId)
        {
            return new ErrorResult("You cannot delete your own admin account.");
        }

        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (user == null)
        {
            return new ErrorResult("User not found.");
        }

        await _unitOfWork.Users.SoftDeleteAsync(userId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.UserPermissions(userId), cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.UserRoles(userId), cancellationToken);

        await _activityLogService.LogAsync(adminUserId, null, "ADMIN_DELETED_USER", "User", userId.ToString(), $"User {user.Email} was soft deleted", cancellationToken: cancellationToken);

        return new SuccessResult("User deleted successfully.");
    }

    public async Task<PagedDataResult<ProjectDto>> GetAllProjectsAsync(PaginationParams paginationParams, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Projects.Query()
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Issues)
            .AsQueryable();

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
        return new PagedDataResult<ProjectDto>(dtos, totalCount, paginationParams.Page, paginationParams.PageSize, "All projects retrieved successfully.");
    }

    public async Task<IResult> DeleteProjectAsync(Guid projectId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (project == null)
        {
            return new ErrorResult("Project not found.");
        }

        await _unitOfWork.Projects.SoftDeleteAsync(projectId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync(CacheKeys.ProjectMeta(projectId), cancellationToken);
        await _activityLogService.LogAsync(adminUserId, projectId, "ADMIN_DELETED_PROJECT", "Project", projectId.ToString(), $"Admin deleted project {project.Name}", cancellationToken: cancellationToken);

        return new SuccessResult("Project deleted successfully by Admin.");
    }

    public async Task<IDataResult<SystemStatisticsDto>> GetSystemStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var cachedStats = await _cacheService.GetAsync<SystemStatisticsDto>(CacheKeys.SystemStats(), cancellationToken);
        if (cachedStats != null)
        {
            return new SuccessDataResult<SystemStatisticsDto>(cachedStats);
        }

        var totalUsers = await _unitOfWork.Users.CountAsync(cancellationToken: cancellationToken);
        var activeUsers = await _unitOfWork.Users.CountAsync(u => u.IsActive, cancellationToken);
        var totalProjects = await _unitOfWork.Projects.CountAsync(cancellationToken: cancellationToken);
        var activeProjects = await _unitOfWork.Projects.CountAsync(p => !p.IsArchived, cancellationToken);
        var totalIssues = await _unitOfWork.Issues.CountAsync(cancellationToken: cancellationToken);
        var completedIssues = await _unitOfWork.Issues.CountAsync(i => i.Status == IssueStatus.Done, cancellationToken);
        var inProgressIssues = await _unitOfWork.Issues.CountAsync(i => i.Status == IssueStatus.InProgress, cancellationToken);
        var totalSprints = await _unitOfWork.Sprints.CountAsync(cancellationToken: cancellationToken);
        var activeSprints = await _unitOfWork.Sprints.CountAsync(s => s.Status == SprintStatus.Active, cancellationToken);
        var totalComments = await _unitOfWork.Comments.CountAsync(cancellationToken: cancellationToken);

        var stats = new SystemStatisticsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalProjects = totalProjects,
            ActiveProjects = activeProjects,
            TotalIssues = totalIssues,
            CompletedIssues = completedIssues,
            InProgressIssues = inProgressIssues,
            TotalSprints = totalSprints,
            ActiveSprints = activeSprints,
            TotalComments = totalComments
        };

        await _cacheService.SetAsync(CacheKeys.SystemStats(), stats, TimeSpan.FromMinutes(5), cancellationToken);

        return new SuccessDataResult<SystemStatisticsDto>(stats);
    }
}

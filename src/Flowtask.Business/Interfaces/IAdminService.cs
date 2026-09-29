using Flowtask.Business.DTOs.Admin;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.DTOs.Users;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;

namespace Flowtask.Business.Interfaces;

public interface IAdminService
{
    Task<PagedDataResult<UserDto>> GetAllUsersAsync(PaginationParams paginationParams, CancellationToken cancellationToken = default);
    Task<IDataResult<UserDto>> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IDataResult<UserDto>> CreateUserAsync(CreateUserAdminRequest request, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<IDataResult<UserDto>> UpdateUserAsync(Guid userId, UpdateUserAdminRequest request, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<IResult> ToggleUserStatusAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<IResult> SetSystemAdminRoleAsync(Guid userId, bool isSystemAdmin, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<IResult> DeleteUserAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<PagedDataResult<ProjectDto>> GetAllProjectsAsync(PaginationParams paginationParams, CancellationToken cancellationToken = default);
    Task<IResult> DeleteProjectAsync(Guid projectId, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<IDataResult<SystemStatisticsDto>> GetSystemStatisticsAsync(CancellationToken cancellationToken = default);
}

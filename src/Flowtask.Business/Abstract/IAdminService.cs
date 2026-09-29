using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.Admin;
using Flowtask.EntityLayer.DTOs.Projects;
using Flowtask.EntityLayer.DTOs.Users;

namespace Flowtask.Business.Abstract;

public interface IAdminService
{
    Task<IDataResult<SystemStatisticsDto>> GetSystemStatisticsAsync();
    Task<IDataResult<PagedDataResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination);
    Task<IDataResult<UserDto>> CreateUserAsync(CreateUserAdminDto request);
    Task<IDataResult<UserDto>> UpdateUserAsync(Guid userId, UpdateUserAdminDto request);
    Task<IResult> DeleteUserAsync(Guid userId);
    Task<IDataResult<PagedDataResult<ProjectDto>>> GetAllProjectsAsync(PaginationParams pagination);
    Task<IResult> DeleteProjectAsync(Guid projectId);
}

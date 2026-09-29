using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.Users;

namespace Flowtask.Business.Abstract;

public interface IUserService
{
    Task<IDataResult<UserDto>> GetCurrentUserAsync(Guid currentUserId);
    Task<IDataResult<UserDto>> UpdateProfileAsync(Guid currentUserId, UpdateProfileDto request);
    Task<IResult> ChangePasswordAsync(Guid currentUserId, ChangePasswordDto request);
    Task<IDataResult<PagedDataResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination);
    Task<IDataResult<UserDto>> GetUserByIdAsync(Guid id);
}

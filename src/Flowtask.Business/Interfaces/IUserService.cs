using Flowtask.Business.DTOs.Users;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;

namespace Flowtask.Business.Interfaces;

public interface IUserService
{
    Task<IDataResult<UserDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IDataResult<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<IResult> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<PagedDataResult<UserDto>> GetUsersAsync(PaginationParams paginationParams, CancellationToken cancellationToken = default);
}

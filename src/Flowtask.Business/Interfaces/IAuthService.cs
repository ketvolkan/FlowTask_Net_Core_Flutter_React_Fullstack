using Flowtask.Business.DTOs.Auth;
using Flowtask.Core.Results;

namespace Flowtask.Business.Interfaces;

public interface IAuthService
{
    Task<IDataResult<LoginResponse>> LoginAsync(LoginRequest request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<IDataResult<LoginResponse>> RegisterAsync(RegisterRequest request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<IDataResult<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<IResult> LogoutAsync(Guid userId, string? refreshToken = null, CancellationToken cancellationToken = default);
    Task<IDataResult<AuthUserDto>> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}

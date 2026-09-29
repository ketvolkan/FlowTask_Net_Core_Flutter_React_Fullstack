using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Auth;

namespace Flowtask.Business.Abstract;

public interface IAuthService
{
    Task<IDataResult<TokenDto>> RegisterAsync(UserForRegisterDto request);
    Task<IDataResult<TokenDto>> LoginAsync(UserForLoginDto request);
    Task<IDataResult<TokenDto>> RefreshTokenAsync(RefreshTokenDto request);
    Task<IResult> RevokeTokenAsync(RefreshTokenDto request);
    Task<IDataResult<AuthUserDto>> GetCurrentUserAsync(Guid userId);
}

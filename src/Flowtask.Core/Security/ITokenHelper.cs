using System.Security.Claims;

namespace Flowtask.Core.Security;

public interface ITokenHelper
{
    AccessToken CreateToken(Guid userId, string email, string fullName, bool isSystemAdmin, IEnumerable<string> roles, IEnumerable<string> permissions);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

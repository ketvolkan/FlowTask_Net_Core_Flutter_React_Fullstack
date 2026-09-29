using System.Security.Claims;

namespace Flowtask.Core.Security;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal? principal)
    {
        var idClaim = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : null;
    }

    public static string? GetEmail(this ClaimsPrincipal? principal)
    {
        return principal?.FindFirst(ClaimTypes.Email)?.Value;
    }

    public static bool IsSystemAdmin(this ClaimsPrincipal? principal)
    {
        var claim = principal?.FindFirst("is_system_admin")?.Value;
        return bool.TryParse(claim, out var isAdmin) && isAdmin;
    }

    public static IEnumerable<string> GetRoles(this ClaimsPrincipal? principal)
    {
        return principal?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? Enumerable.Empty<string>();
    }

    public static IEnumerable<string> GetPermissions(this ClaimsPrincipal? principal)
    {
        return principal?.FindAll("permission").Select(c => c.Value) ?? Enumerable.Empty<string>();
    }
}

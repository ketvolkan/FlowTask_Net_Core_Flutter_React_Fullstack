using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Auth;

public class TokenDto : IDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public AuthUserDto User { get; set; } = null!;
}

namespace Flowtask.Core.Security;

public class AccessToken
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
}

namespace Flowtask.Core.Security;

public class AccessToken
{
    public string Token { get; set; } = string.Empty;
    public string AccessTokenValue { get => Token; set => Token = value; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public DateTime ExpiresAt { get => Expiration; set => Expiration = value; }
    public DateTime RefreshTokenExpiration { get; set; }
}

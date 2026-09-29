using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Auth;

public class RefreshTokenDto : IDto
{
    public string RefreshToken { get; set; } = string.Empty;
}

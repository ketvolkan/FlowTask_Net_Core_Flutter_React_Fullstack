using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Auth;

public class UserForLoginDto : IDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

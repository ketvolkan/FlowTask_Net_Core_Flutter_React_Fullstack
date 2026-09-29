using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Auth;

public class UserForRegisterDto : IDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
}

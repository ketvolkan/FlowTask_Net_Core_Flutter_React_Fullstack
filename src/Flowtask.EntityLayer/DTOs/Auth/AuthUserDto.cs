using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Auth;

public class AuthUserDto : IDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public bool IsSystemAdmin => Roles.Contains("SystemAdmin") || Roles.Contains("Admin");
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Users;

public class CreateUserAdminDto : IDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public List<string> Roles { get; set; } = new();
}

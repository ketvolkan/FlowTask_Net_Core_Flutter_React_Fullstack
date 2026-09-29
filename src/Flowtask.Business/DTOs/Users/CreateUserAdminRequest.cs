namespace Flowtask.Business.DTOs.Users;

public class CreateUserAdminRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public bool IsSystemAdmin { get; set; } = false;
    public List<string> RoleNames { get; set; } = new();
}

namespace Flowtask.Business.DTOs.Users;

public class UpdateUserAdminRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemAdmin { get; set; }
}

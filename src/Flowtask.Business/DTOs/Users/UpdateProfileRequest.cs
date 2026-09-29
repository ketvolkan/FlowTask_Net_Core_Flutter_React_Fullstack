namespace Flowtask.Business.DTOs.Users;

public class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
}

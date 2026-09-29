using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Users;

public class UpdateProfileDto : IDto
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
}

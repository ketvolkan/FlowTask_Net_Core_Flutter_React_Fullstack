using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Users;

public class ChangePasswordDto : IDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

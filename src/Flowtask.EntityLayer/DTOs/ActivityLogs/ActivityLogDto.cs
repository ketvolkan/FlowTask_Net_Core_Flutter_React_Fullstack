using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.ActivityLogs;

public class ActivityLogDto : IDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Notifications;

public class NotificationDto : IDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public string? LinkUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

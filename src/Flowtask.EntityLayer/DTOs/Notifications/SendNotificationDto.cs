using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Notifications;

public class SendNotificationDto : IDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.SystemAlert;
    public string? LinkUrl { get; set; }
    public string TargetType { get; set; } = "All"; // "All", "SpecificUsers", "Department", "Company"
    public List<Guid>? TargetUserIds { get; set; }
    public string? Department { get; set; }
    public string? CompanyName { get; set; }
}

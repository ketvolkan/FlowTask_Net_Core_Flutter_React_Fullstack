using Flowtask.EntityLayer.Common;

namespace Flowtask.EntityLayer.Entities;

public class ActivityLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Action { get; set; } = string.Empty; // e.g. "ISSUE_STATUS_CHANGED", "MEMBER_ADDED"
    public string EntityType { get; set; } = string.Empty; // e.g. "Issue", "Project", "Sprint"
    public string EntityName { get => EntityType; set => EntityType = value; }
    public string EntityId { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? IpAddress { get; set; }
}

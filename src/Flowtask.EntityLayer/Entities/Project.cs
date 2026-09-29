using Flowtask.EntityLayer.Common;

namespace Flowtask.EntityLayer.Entities;

public class Project : BaseEntity, ISoftDeletable
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty; // e.g. "FLW"
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public bool IsArchived { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}

using Flowtask.EntityLayer.Common;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.Entities;

public class Issue : BaseEntity, ISoftDeletable
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public string IssueKey { get; set; } = string.Empty; // e.g. "FLW-101"
    public int IssueNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public IssueType IssueType { get; set; } = IssueType.Task;
    public IssueStatus Status { get; set; } = IssueStatus.Todo;
    public IssuePriority Priority { get; set; } = IssuePriority.Medium;

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public Guid? SprintId { get; set; }
    public Sprint? Sprint { get; set; }

    public int? StoryPoints { get; set; }
    public DateTime? DueDate { get; set; }
    public double OrderIndex { get; set; } = 0; // Kanban column ordering

    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}

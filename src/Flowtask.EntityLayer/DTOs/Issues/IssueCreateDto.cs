using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Issues;

public class IssueCreateDto : IDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType Type { get; set; } = IssueType.Task;
    public IssuePriority Priority { get; set; } = IssuePriority.Medium;
    public IssueStatus Status { get; set; } = IssueStatus.Backlog;
    public int? StoryPoints { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? SprintId { get; set; }
    public Guid? AssigneeId { get; set; }
}

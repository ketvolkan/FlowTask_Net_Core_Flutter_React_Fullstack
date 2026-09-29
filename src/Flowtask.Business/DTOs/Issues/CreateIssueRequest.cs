using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Issues;

public class CreateIssueRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType IssueType { get; set; } = IssueType.Task;
    public IssuePriority Priority { get; set; } = IssuePriority.Medium;
    public IssueStatus Status { get; set; } = IssueStatus.Todo;
    public Guid? AssigneeId { get; set; }
    public Guid? SprintId { get; set; }
    public int? StoryPoints { get; set; }
    public DateTime? DueDate { get; set; }
}

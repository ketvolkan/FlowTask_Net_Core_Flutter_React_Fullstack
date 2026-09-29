using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Issues;

public class UpdateIssueRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType IssueType { get; set; }
    public IssuePriority Priority { get; set; }
    public Guid? AssigneeId { get; set; }
    public Guid? SprintId { get; set; }
    public int? StoryPoints { get; set; }
    public DateTime? DueDate { get; set; }
}

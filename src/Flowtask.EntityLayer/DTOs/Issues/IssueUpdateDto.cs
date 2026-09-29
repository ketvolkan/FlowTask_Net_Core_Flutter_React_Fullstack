using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Issues;

public class IssueUpdateDto : IDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType Type { get; set; }
    public IssuePriority Priority { get; set; }
    public IssueStatus Status { get; set; }
    public int? StoryPoints { get; set; }
    public double Order { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? SprintId { get; set; }
    public Guid? AssigneeId { get; set; }
}

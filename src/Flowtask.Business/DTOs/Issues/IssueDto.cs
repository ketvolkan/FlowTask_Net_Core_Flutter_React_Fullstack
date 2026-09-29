using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Issues;

public class IssueDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectKey { get; set; } = string.Empty;
    public string IssueKey { get; set; } = string.Empty;
    public int IssueNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType IssueType { get; set; }
    public IssueStatus Status { get; set; }
    public IssuePriority Priority { get; set; }
    public Guid ReporterId { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string? ReporterAvatarUrl { get; set; }
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatarUrl { get; set; }
    public Guid? SprintId { get; set; }
    public string? SprintName { get; set; }
    public int? StoryPoints { get; set; }
    public DateTime? DueDate { get; set; }
    public double OrderIndex { get; set; }
    public int CommentCount { get; set; }
    public int AttachmentCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

using Flowtask.Core.Entities;
using Flowtask.EntityLayer.DTOs.Attachments;
using Flowtask.EntityLayer.DTOs.Comments;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Issues;

public class IssueDto : IDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType Type { get; set; }
    public IssuePriority Priority { get; set; }
    public IssueStatus Status { get; set; }
    public int? StoryPoints { get; set; }
    public double Order { get; set; }
    public DateTime? DueDate { get; set; }

    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectKey { get; set; } = string.Empty;

    public Guid? SprintId { get; set; }
    public string? SprintName { get; set; }

    public Guid ReporterId { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string? ReporterAvatarUrl { get; set; }

    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatarUrl { get; set; }

    public int CommentCount { get; set; }
    public int AttachmentCount { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<CommentDto> Comments { get; set; } = new();
    public List<AttachmentDto> Attachments { get; set; } = new();
}

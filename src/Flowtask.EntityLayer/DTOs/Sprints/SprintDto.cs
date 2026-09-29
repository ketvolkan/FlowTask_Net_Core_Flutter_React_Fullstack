using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Sprints;

public class SprintDto : IDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public SprintStatus Status { get; set; }
    public Guid ProjectId { get; set; }
    public int TotalIssues { get; set; }
    public int IssueCount { get => TotalIssues; set => TotalIssues = value; }
    public int CompletedIssues { get; set; }
    public int CompletedIssueCount { get => CompletedIssues; set => CompletedIssues = value; }
    public int InProgressIssues { get; set; }
    public int TotalStoryPoints { get; set; }
    public int CompletedStoryPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}

using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Sprints;

public class SprintDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public SprintStatus Status { get; set; }
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public int InProgressIssues { get; set; }
    public int TotalStoryPoints { get; set; }
    public int CompletedStoryPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}

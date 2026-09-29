using Flowtask.Core.Entities;
using Flowtask.EntityLayer.DTOs.Issues;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Sprints;

public class SprintDetailDto : IDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public SprintStatus Status { get; set; }
    public Guid ProjectId { get; set; }
    public List<IssueDto> Issues { get; set; } = new();
    public int TotalStoryPoints { get; set; }
    public int CompletedStoryPoints { get; set; }
}

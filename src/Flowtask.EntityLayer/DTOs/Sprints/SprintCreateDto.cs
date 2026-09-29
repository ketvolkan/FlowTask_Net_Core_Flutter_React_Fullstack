using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Sprints;

public class SprintCreateDto : IDto
{
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

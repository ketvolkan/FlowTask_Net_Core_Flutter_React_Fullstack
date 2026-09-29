using Flowtask.EntityLayer.Common;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.Entities;

public class Sprint : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public SprintStatus Status { get; set; } = SprintStatus.Planned;

    // Navigation properties
    public ICollection<Issue> Issues { get; set; } = new List<Issue>();
}

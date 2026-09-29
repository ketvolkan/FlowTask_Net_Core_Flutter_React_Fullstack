using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Admin;

public class SystemStatisticsDto : IDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalProjects { get; set; }
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public int TotalSprints { get; set; }
    public int ActiveSprints { get; set; }
}

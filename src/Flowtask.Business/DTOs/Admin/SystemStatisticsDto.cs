namespace Flowtask.Business.DTOs.Admin;

public class SystemStatisticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalProjects { get; set; }
    public int ActiveProjects { get; set; }
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public int InProgressIssues { get; set; }
    public int TotalSprints { get; set; }
    public int ActiveSprints { get; set; }
    public int TotalComments { get; set; }
}

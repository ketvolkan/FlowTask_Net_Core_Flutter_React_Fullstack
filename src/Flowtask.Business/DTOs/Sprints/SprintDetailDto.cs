using Flowtask.Business.DTOs.Issues;

namespace Flowtask.Business.DTOs.Sprints;

public class SprintDetailDto : SprintDto
{
    public List<IssueDto> Issues { get; set; } = new();
}

namespace Flowtask.Business.DTOs.Projects;

public class ProjectDetailDto : ProjectDto
{
    public List<ProjectMemberDto> Members { get; set; } = new();
}

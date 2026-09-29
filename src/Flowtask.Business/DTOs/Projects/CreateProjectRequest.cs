namespace Flowtask.Business.DTOs.Projects;

public class CreateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
}

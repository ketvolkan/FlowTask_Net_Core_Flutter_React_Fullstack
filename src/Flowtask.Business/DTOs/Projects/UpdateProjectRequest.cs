namespace Flowtask.Business.DTOs.Projects;

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsArchived { get; set; }
}

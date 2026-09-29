using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Projects;

public class ProjectCreateDto : IDto
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
}

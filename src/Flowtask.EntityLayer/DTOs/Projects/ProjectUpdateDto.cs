using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Projects;

public class ProjectUpdateDto : IDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsArchived { get; set; }
}

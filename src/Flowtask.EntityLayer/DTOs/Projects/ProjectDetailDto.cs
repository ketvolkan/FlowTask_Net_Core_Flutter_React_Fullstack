using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Projects;

public class ProjectDetailDto : IDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerAvatarUrl { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ProjectMemberDto> Members { get; set; } = new();
    public int TotalIssues { get; set; }
    public int OpenIssues { get; set; }
    public int DoneIssues { get; set; }
}

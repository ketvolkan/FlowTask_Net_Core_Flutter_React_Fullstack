namespace Flowtask.Business.DTOs.Projects;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public int MemberCount { get; set; }
    public int IssueCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Projects;

public class ProjectMemberDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? JobTitle { get; set; }
    public ProjectRoleType Role { get; set; }
    public DateTime JoinedAt { get; set; }
}

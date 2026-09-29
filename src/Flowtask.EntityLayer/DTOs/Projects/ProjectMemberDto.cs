using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Projects;

public class ProjectMemberDto : IDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string UserFullName { get => FullName; set => FullName = value; }
    public string Email { get; set; } = string.Empty;
    public string UserEmail { get => Email; set => Email = value; }
    public string? AvatarUrl { get; set; }
    public string? UserAvatarUrl { get => AvatarUrl; set => AvatarUrl = value; }
    public string? JobTitle { get; set; }
    public ProjectRoleType Role { get; set; }
    public DateTime JoinedAt { get; set; }
}

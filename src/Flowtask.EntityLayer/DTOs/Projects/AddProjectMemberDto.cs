using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Projects;

public class AddProjectMemberDto : IDto
{
    public string? Email { get; set; }
    public Guid? UserId { get; set; }
    public ProjectRoleType Role { get; set; } = ProjectRoleType.Member;
}

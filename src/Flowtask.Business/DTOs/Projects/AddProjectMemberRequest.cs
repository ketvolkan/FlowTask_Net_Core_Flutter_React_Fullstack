using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Projects;

public class AddProjectMemberRequest
{
    public Guid UserId { get; set; }
    public ProjectRoleType Role { get; set; } = ProjectRoleType.Member;
}

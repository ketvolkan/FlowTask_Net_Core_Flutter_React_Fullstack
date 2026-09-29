using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Projects;

public class UpdateMemberRoleDto : IDto
{
    public ProjectRoleType Role { get; set; }
}

using Flowtask.EntityLayer.Common;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.Entities;

public class ProjectMember : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ProjectRoleType Role { get; set; } = ProjectRoleType.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

using Flowtask.EntityLayer.Common;

namespace Flowtask.EntityLayer.Entities;

public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

using Flowtask.EntityLayer.Common;

namespace Flowtask.EntityLayer.Entities;

public class Comment : BaseEntity, ISoftDeletable
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}

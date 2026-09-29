using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Comments;

public class CommentDto : IDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid IssueId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

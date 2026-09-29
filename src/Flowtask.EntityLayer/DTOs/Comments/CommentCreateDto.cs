using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Comments;

public class CommentCreateDto : IDto
{
    public string Content { get; set; } = string.Empty;
}

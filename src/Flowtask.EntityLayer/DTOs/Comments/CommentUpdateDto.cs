using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Comments;

public class CommentUpdateDto : IDto
{
    public string Content { get; set; } = string.Empty;
}

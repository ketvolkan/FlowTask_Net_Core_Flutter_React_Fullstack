using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Comments;

namespace Flowtask.Business.Abstract;

public interface ICommentService
{
    Task<IDataResult<List<CommentDto>>> GetIssueCommentsAsync(Guid issueId, Guid userId);
    Task<IDataResult<CommentDto>> AddCommentAsync(Guid issueId, Guid userId, CommentCreateDto request);
    Task<IDataResult<CommentDto>> UpdateCommentAsync(Guid commentId, Guid userId, CommentUpdateDto request);
    Task<IResult> DeleteCommentAsync(Guid commentId, Guid userId);
}

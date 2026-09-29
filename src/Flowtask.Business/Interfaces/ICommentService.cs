using Flowtask.Business.DTOs.Comments;
using Flowtask.Core.Results;

namespace Flowtask.Business.Interfaces;

public interface ICommentService
{
    Task<IDataResult<IReadOnlyList<CommentDto>>> GetCommentsAsync(Guid projectId, Guid issueId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<CommentDto>> AddCommentAsync(Guid projectId, Guid issueId, CreateCommentRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<CommentDto>> UpdateCommentAsync(Guid projectId, Guid issueId, Guid commentId, UpdateCommentRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IResult> DeleteCommentAsync(Guid projectId, Guid issueId, Guid commentId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
}

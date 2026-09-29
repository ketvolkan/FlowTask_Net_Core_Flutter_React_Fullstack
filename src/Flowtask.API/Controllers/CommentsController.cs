using Flowtask.Business.DTOs.Comments;
using Flowtask.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
[Route("api/projects/{projectId:guid}/issues/{issueId:guid}/comments")]
public class CommentsController : BaseApiController
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(Guid projectId, Guid issueId, CancellationToken cancellationToken)
    {
        var result = await _commentService.GetCommentsAsync(projectId, issueId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddComment(Guid projectId, Guid issueId, [FromBody] CreateCommentRequest request, CancellationToken cancellationToken)
    {
        var result = await _commentService.AddCommentAsync(projectId, issueId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("{commentId:guid}")]
    public async Task<IActionResult> UpdateComment(Guid projectId, Guid issueId, Guid commentId, [FromBody] UpdateCommentRequest request, CancellationToken cancellationToken)
    {
        var result = await _commentService.UpdateCommentAsync(projectId, issueId, commentId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpDelete("{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid projectId, Guid issueId, Guid commentId, CancellationToken cancellationToken)
    {
        var result = await _commentService.DeleteCommentAsync(projectId, issueId, commentId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleResult(result);
    }
}

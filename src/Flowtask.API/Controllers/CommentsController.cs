using Flowtask.Business.Abstract;
using Flowtask.EntityLayer.DTOs.Comments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class CommentsController : BaseApiController
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("issue/{issueId:guid}")]
    public async Task<IActionResult> GetComments(Guid issueId)
    {
        var result = await _commentService.GetIssueCommentsAsync(issueId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPost("issue/{issueId:guid}")]
    public async Task<IActionResult> AddComment(Guid issueId, [FromBody] CommentCreateDto request)
    {
        var result = await _commentService.AddCommentAsync(issueId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPut("{commentId:guid}")]
    public async Task<IActionResult> UpdateComment(Guid commentId, [FromBody] CommentUpdateDto request)
    {
        var result = await _commentService.UpdateCommentAsync(commentId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpDelete("{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var result = await _commentService.DeleteCommentAsync(commentId, CurrentUserId);
        return HandleResult(result);
    }
}

using AutoMapper;
using Flowtask.Business.DTOs.Comments;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class CommentService : ICommentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IActivityLogService _activityLogService;
    private readonly INotificationService _notificationService;

    public CommentService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IActivityLogService activityLogService,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _activityLogService = activityLogService;
        _notificationService = notificationService;
    }

    public async Task<IDataResult<IReadOnlyList<CommentDto>>> GetCommentsAsync(Guid projectId, Guid issueId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<IReadOnlyList<CommentDto>>("You do not have access to this project.");
        }

        var comments = await _unitOfWork.Comments.Query()
            .Include(c => c.User)
            .Where(c => c.IssueId == issueId && c.Issue.ProjectId == projectId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<CommentDto>>(comments);
        foreach (var dto in dtos)
        {
            dto.IsOwner = dto.UserId == currentUserId;
        }

        return new SuccessDataResult<IReadOnlyList<CommentDto>>(dtos);
    }

    public async Task<IDataResult<CommentDto>> AddCommentAsync(Guid projectId, Guid issueId, CreateCommentRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        if (!isSystemAdmin && !await HasProjectAccessAsync(projectId, currentUserId, cancellationToken))
        {
            return new ErrorDataResult<CommentDto>("You do not have access to this project.");
        }

        var issue = await _unitOfWork.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, cancellationToken: cancellationToken);
        if (issue == null)
        {
            return new ErrorDataResult<CommentDto>("Issue not found in this project.");
        }

        var comment = new Comment
        {
            IssueId = issueId,
            UserId = currentUserId,
            Content = request.Content.Trim()
        };

        await _unitOfWork.Comments.AddAsync(comment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(currentUserId, projectId, "COMMENT_ADDED", "Comment", comment.Id.ToString(), $"Comment added to {issue.IssueKey}", cancellationToken: cancellationToken);

        if (issue.ReporterId != currentUserId)
        {
            await _notificationService.SendNotificationAsync(
                issue.ReporterId,
                NotificationType.CommentAdded,
                "New Comment on Issue",
                $"New comment added to {issue.IssueKey}",
                $"/app/projects/{projectId}/issues/{issue.Id}",
                cancellationToken);
        }

        var createdWithUser = await _unitOfWork.Comments.Query()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == comment.Id, cancellationToken);

        var dto = _mapper.Map<CommentDto>(createdWithUser);
        dto.IsOwner = true;
        return new SuccessDataResult<CommentDto>(dto, "Comment added successfully.");
    }

    public async Task<IDataResult<CommentDto>> UpdateCommentAsync(Guid projectId, Guid issueId, Guid commentId, UpdateCommentRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var comment = await _unitOfWork.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.IssueId == issueId && c.Issue.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (comment == null)
        {
            return new ErrorDataResult<CommentDto>("Comment not found.");
        }

        if (!isSystemAdmin && comment.UserId != currentUserId)
        {
            return new ErrorDataResult<CommentDto>("You can only edit your own comments.");
        }

        comment.Content = request.Content.Trim();
        _unitOfWork.Comments.Update(comment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedWithUser = await _unitOfWork.Comments.Query()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == comment.Id, cancellationToken);

        var dto = _mapper.Map<CommentDto>(updatedWithUser);
        dto.IsOwner = dto.UserId == currentUserId;
        return new SuccessDataResult<CommentDto>(dto, "Comment updated successfully.");
    }

    public async Task<IResult> DeleteCommentAsync(Guid projectId, Guid issueId, Guid commentId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default)
    {
        var comment = await _unitOfWork.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.IssueId == issueId && c.Issue.ProjectId == projectId, asNoTracking: false, cancellationToken: cancellationToken);
        if (comment == null)
        {
            return new ErrorResult("Comment not found.");
        }

        if (!isSystemAdmin && comment.UserId != currentUserId)
        {
            return new ErrorResult("You do not have permission to delete this comment.");
        }

        await _unitOfWork.Comments.SoftDeleteAsync(commentId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SuccessResult("Comment deleted successfully.");
    }

    private async Task<bool> HasProjectAccessAsync(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        return await _unitOfWork.Projects.AnyAsync(p => p.Id == projectId && (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)), cancellationToken);
    }
}

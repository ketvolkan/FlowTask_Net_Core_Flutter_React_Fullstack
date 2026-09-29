using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.Comments;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Concrete;

public class CommentManager : ICommentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CommentManager(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IDataResult<List<CommentDto>>> GetIssueCommentsAsync(Guid issueId, Guid userId)
    {
        var issue = await _unitOfWork.Issues.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var comments = await _unitOfWork.Comments.GetAllAsync(
            filter: c => c.IssueId == issueId,
            includeProperties: "User",
            orderBy: q => q.OrderBy(c => c.CreatedAt));

        var dtos = _mapper.Map<List<CommentDto>>(comments);
        return new SuccessDataResult<List<CommentDto>>(dtos);
    }

    public async Task<IDataResult<CommentDto>> AddCommentAsync(Guid issueId, Guid userId, CommentCreateDto request)
    {
        var issue = await _unitOfWork.Issues.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var comment = new Comment
        {
            IssueId = issueId,
            UserId = userId,
            Content = request.Content.Trim()
        };

        await _unitOfWork.Comments.AddAsync(comment);
        await _unitOfWork.SaveChangesAsync();

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        comment.User = user!;

        var dto = _mapper.Map<CommentDto>(comment);
        return new SuccessDataResult<CommentDto>(dto, Messages.CommentAdded);
    }

    public async Task<IDataResult<CommentDto>> UpdateCommentAsync(Guid commentId, Guid userId, CommentUpdateDto request)
    {
        var comment = await _unitOfWork.Comments.GetAsync(
            c => c.Id == commentId && c.UserId == userId,
            includeProperties: "User");

        if (comment == null)
        {
            throw new NotFoundException(Messages.CommentNotFound);
        }

        comment.Content = request.Content.Trim();
        comment.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Comments.Update(comment);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<CommentDto>(comment);
        return new SuccessDataResult<CommentDto>(dto, Messages.CommentUpdated);
    }

    public async Task<IResult> DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _unitOfWork.Comments.GetAsync(c => c.Id == commentId && c.UserId == userId);
        if (comment == null)
        {
            throw new NotFoundException(Messages.CommentNotFound);
        }

        _unitOfWork.Comments.Delete(comment);
        await _unitOfWork.SaveChangesAsync();

        return new SuccessResult(Messages.CommentDeleted);
    }
}

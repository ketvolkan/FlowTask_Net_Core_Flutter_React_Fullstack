using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Comments;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Concrete;

public class CommentManager : ICommentService
{
    private readonly ICommentDal _commentDal;
    private readonly IIssueDal _issueDal;
    private readonly IUserDal _userDal;
    private readonly IMapper _mapper;

    public CommentManager(ICommentDal commentDal, IIssueDal issueDal, IUserDal userDal, IMapper mapper)
    {
        _commentDal = commentDal;
        _issueDal = issueDal;
        _userDal = userDal;
        _mapper = mapper;
    }

    public async Task<IDataResult<List<CommentDto>>> GetIssueCommentsAsync(Guid issueId, Guid userId)
    {
        var issue = await _issueDal.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var comments = await _commentDal.GetListAsync(
            filter: c => c.IssueId == issueId,
            includeProperties: "User",
            orderBy: q => q.OrderBy(c => c.CreatedAt));

        var dtos = _mapper.Map<List<CommentDto>>(comments);
        return new SuccessDataResult<List<CommentDto>>(dtos);
    }

    public async Task<IDataResult<CommentDto>> AddCommentAsync(Guid issueId, Guid userId, CommentCreateDto request)
    {
        var issue = await _issueDal.GetAsync(
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

        await _commentDal.AddAsync(comment);

        var user = await _userDal.GetByIdAsync(userId);
        comment.User = user!;

        var dto = _mapper.Map<CommentDto>(comment);
        return new SuccessDataResult<CommentDto>(dto, Messages.CommentAdded);
    }

    public async Task<IDataResult<CommentDto>> UpdateCommentAsync(Guid commentId, Guid userId, CommentUpdateDto request)
    {
        var comment = await _commentDal.GetAsync(
            c => c.Id == commentId && c.UserId == userId,
            includeProperties: "User");

        if (comment == null)
        {
            throw new NotFoundException(Messages.CommentNotFound);
        }

        comment.Content = request.Content.Trim();
        comment.UpdatedAt = DateTime.UtcNow;

        await _commentDal.UpdateAsync(comment);

        var dto = _mapper.Map<CommentDto>(comment);
        return new SuccessDataResult<CommentDto>(dto, Messages.CommentUpdated);
    }

    public async Task<IResult> DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _commentDal.GetAsync(c => c.Id == commentId && c.UserId == userId);
        if (comment == null)
        {
            throw new NotFoundException(Messages.CommentNotFound);
        }

        await _commentDal.DeleteAsync(comment);

        return new SuccessResult(Messages.CommentDeleted);
    }
}

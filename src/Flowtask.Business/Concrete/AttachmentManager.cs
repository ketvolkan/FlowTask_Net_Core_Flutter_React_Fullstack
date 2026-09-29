using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.Attachments;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Concrete;

public class AttachmentManager : IAttachmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AttachmentManager(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IDataResult<List<AttachmentDto>>> GetIssueAttachmentsAsync(Guid issueId, Guid userId)
    {
        var issue = await _unitOfWork.Issues.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var attachments = await _unitOfWork.Attachments.GetAllAsync(
            filter: a => a.IssueId == issueId,
            includeProperties: "UploadedBy",
            orderBy: q => q.OrderByDescending(a => a.CreatedAt));

        var dtos = _mapper.Map<List<AttachmentDto>>(attachments);
        return new SuccessDataResult<List<AttachmentDto>>(dtos);
    }

    public async Task<IDataResult<AttachmentDto>> AddAttachmentAsync(Guid issueId, Guid userId, string fileName, string filePath, string contentType, long fileSizeBytes)
    {
        var issue = await _unitOfWork.Issues.GetAsync(
            i => i.Id == issueId && i.Project.Members.Any(m => m.UserId == userId));

        if (issue == null)
        {
            throw new NotFoundException(Messages.IssueNotFound);
        }

        var attachment = new Attachment
        {
            IssueId = issueId,
            UploadedById = userId,
            FileName = fileName,
            StoredFileName = fileName,
            FilePath = filePath,
            ContentType = contentType,
            FileSize = fileSizeBytes
        };

        await _unitOfWork.Attachments.AddAsync(attachment);
        await _unitOfWork.SaveChangesAsync();

        var uploader = await _unitOfWork.Users.GetByIdAsync(userId);
        attachment.UploadedBy = uploader!;

        var dto = _mapper.Map<AttachmentDto>(attachment);
        return new SuccessDataResult<AttachmentDto>(dto, Messages.AttachmentUploaded);
    }

    public async Task<IResult> DeleteAttachmentAsync(Guid attachmentId, Guid userId)
    {
        var attachment = await _unitOfWork.Attachments.GetAsync(
            a => a.Id == attachmentId && a.UploadedById == userId);

        if (attachment == null)
        {
            throw new NotFoundException(Messages.AttachmentNotFound);
        }

        _unitOfWork.Attachments.Delete(attachment);
        await _unitOfWork.SaveChangesAsync();

        return new SuccessResult(Messages.AttachmentDeleted);
    }
}

using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Attachments;

namespace Flowtask.Business.Abstract;

public interface IAttachmentService
{
    Task<IDataResult<List<AttachmentDto>>> GetIssueAttachmentsAsync(Guid issueId, Guid userId);
    Task<IDataResult<AttachmentDto>> AddAttachmentAsync(Guid issueId, Guid userId, string fileName, string filePath, string contentType, long fileSizeBytes);
    Task<IResult> DeleteAttachmentAsync(Guid attachmentId, Guid userId);
}

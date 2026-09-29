using Flowtask.EntityLayer.Common;

namespace Flowtask.EntityLayer.Entities;

public class Attachment : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;

    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

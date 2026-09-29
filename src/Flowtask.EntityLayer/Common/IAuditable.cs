namespace Flowtask.EntityLayer.Common;

public interface IAuditable
{
    Guid? CreatedByUserId { get; set; }
    Guid? UpdatedByUserId { get; set; }
}

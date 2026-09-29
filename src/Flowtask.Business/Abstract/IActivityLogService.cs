using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.ActivityLogs;

namespace Flowtask.Business.Abstract;

public interface IActivityLogService
{
    Task<IDataResult<PagedDataResult<ActivityLogDto>>> GetLogsAsync(Guid? projectId, PaginationParams pagination);
    Task LogActivityAsync(Guid userId, string action, string entityName, Guid entityId, string? details = null, Guid? projectId = null, string? ipAddress = null);
}

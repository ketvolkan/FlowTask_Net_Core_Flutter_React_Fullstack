using Flowtask.Business.DTOs.ActivityLogs;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;

namespace Flowtask.Business.Interfaces;

public interface IActivityLogService
{
    Task LogAsync(Guid? userId, Guid? projectId, string action, string entityType, string entityId, string? details = null, string? oldValue = null, string? newValue = null, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<PagedDataResult<ActivityLogDto>> GetActivityLogsAsync(Guid? projectId, PaginationParams paginationParams, CancellationToken cancellationToken = default);
}

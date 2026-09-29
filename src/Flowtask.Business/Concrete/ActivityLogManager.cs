using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.ActivityLogs;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Concrete;

public class ActivityLogManager : IActivityLogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ActivityLogManager(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IDataResult<PagedDataResult<ActivityLogDto>>> GetLogsAsync(Guid? projectId, PaginationParams pagination)
    {
        var (logs, totalCount) = await _unitOfWork.ActivityLogs.GetPagedAsync(
            filter: l => !projectId.HasValue || l.ProjectId == projectId.Value,
            page: pagination.Page,
            pageSize: pagination.PageSize,
            includeProperties: "User",
            orderBy: q => q.OrderByDescending(l => l.CreatedAt));

        var dtos = _mapper.Map<List<ActivityLogDto>>(logs);
        var pagedResult = PagedDataResult<ActivityLogDto>.Create(dtos, totalCount, pagination.Page, pagination.PageSize);
        return new SuccessDataResult<PagedDataResult<ActivityLogDto>>(pagedResult);
    }

    public async Task LogActivityAsync(Guid userId, string action, string entityName, Guid entityId, string? details = null, Guid? projectId = null, string? ipAddress = null)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityName,
            EntityId = entityId.ToString(),
            Details = details,
            ProjectId = projectId,
            IpAddress = ipAddress
        };

        await _unitOfWork.ActivityLogs.AddAsync(log);
        await _unitOfWork.SaveChangesAsync();
    }
}

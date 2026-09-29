using AutoMapper;
using Flowtask.Business.DTOs.ActivityLogs;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ActivityLogService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task LogAsync(Guid? userId, Guid? projectId, string action, string entityType, string entityId, string? details = null, string? oldValue = null, string? newValue = null, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var log = new ActivityLog
        {
            UserId = userId,
            ProjectId = projectId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            OldValue = oldValue,
            NewValue = newValue,
            IpAddress = ipAddress
        };

        await _unitOfWork.ActivityLogs.AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedDataResult<ActivityLogDto>> GetActivityLogsAsync(Guid? projectId, PaginationParams paginationParams, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.ActivityLogs.Query()
            .Include(al => al.User)
            .Include(al => al.Project)
            .AsQueryable();

        if (projectId.HasValue)
        {
            query = query.Where(al => al.ProjectId == projectId.Value);
        }

        if (!string.IsNullOrWhiteSpace(paginationParams.Search))
        {
            var search = paginationParams.Search.Trim().ToLower();
            query = query.Where(al => al.Action.ToLower().Contains(search) || al.EntityType.ToLower().Contains(search) || (al.Details != null && al.Details.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var logs = await query
            .OrderByDescending(al => al.CreatedAt)
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ActivityLogDto>>(logs);
        return new PagedDataResult<ActivityLogDto>(dtos, totalCount, paginationParams.Page, paginationParams.PageSize, "Activity logs retrieved successfully.");
    }
}

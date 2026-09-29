using AutoMapper;
using Flowtask.Business.DTOs.Notifications;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Results;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public NotificationService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IDataResult<IReadOnlyList<NotificationDto>>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var notifications = await _unitOfWork.Notifications.Query()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<NotificationDto>>(notifications);
        return new SuccessDataResult<IReadOnlyList<NotificationDto>>(dtos);
    }

    public async Task<IDataResult<int>> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var count = await _unitOfWork.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);
        return new SuccessDataResult<int>(count);
    }

    public async Task<IResult> MarkAsReadAsync(Guid notificationId, Guid userId, CancellationToken cancellationToken = default)
    {
        var notification = await _unitOfWork.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (notification == null)
        {
            return new ErrorResult("Notification not found.");
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        _unitOfWork.Notifications.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SuccessResult("Notification marked as read.");
    }

    public async Task<IResult> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var unreadNotifications = await _unitOfWork.Notifications.GetAsync(n => n.UserId == userId && !n.IsRead, asNoTracking: false, cancellationToken: cancellationToken);
        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            _unitOfWork.Notifications.Update(notification);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new SuccessResult("All notifications marked as read.");
    }

    public async Task SendNotificationAsync(Guid userId, NotificationType type, string title, string message, string? targetUrl = null, CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            TargetUrl = targetUrl,
            IsRead = false
        };

        await _unitOfWork.Notifications.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

using Flowtask.Business.DTOs.Notifications;
using Flowtask.Core.Results;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Interfaces;

public interface INotificationService
{
    Task<IDataResult<IReadOnlyList<NotificationDto>>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IDataResult<int>> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IResult> MarkAsReadAsync(Guid notificationId, Guid userId, CancellationToken cancellationToken = default);
    Task<IResult> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task SendNotificationAsync(Guid userId, NotificationType type, string title, string message, string? targetUrl = null, CancellationToken cancellationToken = default);
}

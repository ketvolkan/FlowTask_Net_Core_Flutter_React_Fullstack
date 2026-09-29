using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Notifications;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Abstract;

public interface INotificationService
{
    Task<IDataResult<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId);
    Task<IResult> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task<IResult> MarkAllAsReadAsync(Guid userId);
    Task<IResult> SendNotificationAsync(Guid senderUserId, SendNotificationDto request);
    Task<IDataResult<NotificationDto>> CreateAndSendNotificationAsync(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        string? linkUrl = null);
}

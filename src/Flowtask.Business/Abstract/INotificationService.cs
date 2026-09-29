using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Notifications;

namespace Flowtask.Business.Abstract;

public interface INotificationService
{
    Task<IDataResult<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId);
    Task<IResult> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task<IResult> MarkAllAsReadAsync(Guid userId);
}

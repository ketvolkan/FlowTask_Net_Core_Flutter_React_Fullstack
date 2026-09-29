using Flowtask.EntityLayer.DTOs.Notifications;

namespace Flowtask.Business.Abstract;

public interface INotificationDispatcher
{
    Task SendNotificationToUserAsync(Guid userId, NotificationDto notification);
    Task SendNotificationToUsersAsync(IEnumerable<Guid> userIds, NotificationDto notification);
    Task BroadcastNotificationAsync(NotificationDto notification);
    Task BroadcastUrgentAlertAsync(NotificationDto alertNotification);
}

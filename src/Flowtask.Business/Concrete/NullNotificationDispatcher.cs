using Flowtask.Business.Abstract;
using Flowtask.EntityLayer.DTOs.Notifications;

namespace Flowtask.Business.Concrete;

public class NullNotificationDispatcher : INotificationDispatcher
{
    public Task SendNotificationToUserAsync(Guid userId, NotificationDto notification) => Task.CompletedTask;
    public Task SendNotificationToUsersAsync(IEnumerable<Guid> userIds, NotificationDto notification) => Task.CompletedTask;
    public Task BroadcastNotificationAsync(NotificationDto notification) => Task.CompletedTask;
    public Task BroadcastUrgentAlertAsync(NotificationDto alertNotification) => Task.CompletedTask;
}

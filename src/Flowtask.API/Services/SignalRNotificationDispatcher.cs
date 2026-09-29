using Flowtask.API.Hubs;
using Flowtask.Business.Abstract;
using Flowtask.EntityLayer.DTOs.Notifications;
using Flowtask.EntityLayer.Enums;
using Microsoft.AspNetCore.SignalR;

namespace Flowtask.API.Services;

public class SignalRNotificationDispatcher : INotificationDispatcher
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationDispatcher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationToUserAsync(Guid userId, NotificationDto notification)
    {
        await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);

        if (notification.Type == NotificationType.SystemAlert || notification.Type == NotificationType.UrgentAlert)
        {
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveUrgentAlert", notification);
        }
    }

    public async Task SendNotificationToUsersAsync(IEnumerable<Guid> userIds, NotificationDto notification)
    {
        foreach (var userId in userIds)
        {
            await SendNotificationToUserAsync(userId, notification);
        }
    }

    public async Task BroadcastNotificationAsync(NotificationDto notification)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
    }

    public async Task BroadcastUrgentAlertAsync(NotificationDto alertNotification)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveUrgentAlert", alertNotification);
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", alertNotification);
    }
}

using Flowtask.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserNotifications(CancellationToken cancellationToken)
    {
        var result = await _notificationService.GetUserNotificationsAsync(CurrentUserId, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var result = await _notificationService.GetUnreadCountAsync(CurrentUserId, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var result = await _notificationService.MarkAsReadAsync(id, CurrentUserId, cancellationToken);
        return HandleResult(result);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var result = await _notificationService.MarkAllAsReadAsync(CurrentUserId, cancellationToken);
        return HandleResult(result);
    }
}

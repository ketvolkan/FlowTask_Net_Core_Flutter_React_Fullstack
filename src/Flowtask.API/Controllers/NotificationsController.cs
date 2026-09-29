using Flowtask.Business.Abstract;
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
    public async Task<IActionResult> GetUserNotifications()
    {
        var result = await _notificationService.GetUserNotificationsAsync(CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var result = await _notificationService.MarkAsReadAsync(id, CurrentUserId);
        return HandleResult(result);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await _notificationService.MarkAllAsReadAsync(CurrentUserId);
        return HandleResult(result);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendNotification([FromBody] Flowtask.EntityLayer.DTOs.Notifications.SendNotificationDto request)
    {
        var result = await _notificationService.SendNotificationAsync(CurrentUserId, request);
        return HandleResult(result);
    }
}

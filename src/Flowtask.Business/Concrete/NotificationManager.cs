using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Notifications;

namespace Flowtask.Business.Concrete;

public class NotificationManager : INotificationService
{
    private readonly INotificationDal _notificationDal;
    private readonly IMapper _mapper;

    public NotificationManager(INotificationDal notificationDal, IMapper mapper)
    {
        _notificationDal = notificationDal;
        _mapper = mapper;
    }

    public async Task<IDataResult<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId)
    {
        var notifications = await _notificationDal.GetListAsync(
            filter: n => n.UserId == userId,
            orderBy: q => q.OrderByDescending(n => n.CreatedAt));

        var dtos = _mapper.Map<List<NotificationDto>>(notifications);
        return new SuccessDataResult<List<NotificationDto>>(dtos);
    }

    public async Task<IResult> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _notificationDal.GetAsync(
            n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
        {
            throw new NotFoundException(Messages.NotificationNotFound);
        }

        notification.IsRead = true;
        await _notificationDal.UpdateAsync(notification);

        return new SuccessResult(Messages.NotificationMarkedAsRead);
    }

    public async Task<IResult> MarkAllAsReadAsync(Guid userId)
    {
        var unreadNotifications = await _notificationDal.GetListAsync(
            filter: n => n.UserId == userId && !n.IsRead);

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        _notificationDal.UpdateRange(unreadNotifications);

        return new SuccessResult(Messages.AllNotificationsMarkedAsRead);
    }
}

using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Notifications;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Concrete;

public class NotificationManager : INotificationService
{
    private readonly INotificationDal _notificationDal;
    private readonly IUserDal _userDal;
    private readonly IMapper _mapper;

    public NotificationManager(INotificationDal notificationDal, IUserDal userDal, IMapper mapper)
    {
        _notificationDal = notificationDal;
        _userDal = userDal;
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

    public async Task<IResult> SendNotificationAsync(Guid senderUserId, SendNotificationDto request)
    {
        var sender = await _userDal.GetAsync(u => u.Id == senderUserId, includeProperties: "UserRoles.Role");
        if (sender == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        bool isAuthorized = sender.IsSystemAdmin ||
                            sender.UserRoles.Any(ur => ur.Role.Name == "Admin" || ur.Role.Name == "Manager" || ur.Role.Name == "CompanyAdmin" || ur.Role.Name == "ProjectManager") ||
                            (!string.IsNullOrEmpty(sender.JobTitle) && (
                                sender.JobTitle.Contains("Manager", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Yönetici", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Direktör", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Lead", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Lider", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Owner", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("CTO", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("CEO", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("Kurucu", StringComparison.OrdinalIgnoreCase) ||
                                sender.JobTitle.Contains("PM", StringComparison.OrdinalIgnoreCase)
                            ));

        if (!isAuthorized)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        List<Guid> targetUserIds = new();

        if (request.TargetType == "SpecificUsers" && request.TargetUserIds != null && request.TargetUserIds.Any())
        {
            targetUserIds = request.TargetUserIds.Distinct().ToList();
        }
        else if (request.TargetType == "Department" && !string.IsNullOrWhiteSpace(request.Department))
        {
            var deptUsers = await _userDal.GetListAsync(u => !u.IsDeleted && u.Department != null && u.Department.ToLower() == request.Department.Trim().ToLower());
            targetUserIds = deptUsers.Select(u => u.Id).ToList();
        }
        else
        {
            // All active platform/company users
            var allUsers = await _userDal.GetListAsync(u => !u.IsDeleted && u.IsActive);
            targetUserIds = allUsers.Select(u => u.Id).ToList();
        }

        if (targetUserIds.Count == 0)
        {
            return new SuccessResult("Hedef kullanıcı bulunamadı.");
        }

        var notifications = targetUserIds.Select(uId => new Notification
        {
            UserId = uId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            TargetUrl = request.LinkUrl?.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _notificationDal.AddRangeAsync(notifications);

        return new SuccessResult($"{notifications.Count} kullanıcıya bildirim başarıyla gönderildi.");
    }
}

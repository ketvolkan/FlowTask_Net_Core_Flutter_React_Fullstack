using AutoMapper;
using Flowtask.Business.DTOs.Notifications;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class NotificationProfile : Profile
{
    public NotificationProfile()
    {
        CreateMap<Notification, NotificationDto>();
    }
}

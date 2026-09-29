using AutoMapper;
using Flowtask.EntityLayer.DTOs.Notifications;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class NotificationProfile : Profile
{
    public NotificationProfile()
    {
        CreateMap<Notification, NotificationDto>();
    }
}

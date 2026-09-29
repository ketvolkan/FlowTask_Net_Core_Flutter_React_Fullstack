using AutoMapper;
using Flowtask.Business.DTOs.Comments;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class CommentProfile : Profile
{
    public CommentProfile()
    {
        CreateMap<Comment, CommentDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.UserAvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl));
    }
}

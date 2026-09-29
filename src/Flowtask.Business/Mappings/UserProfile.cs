using AutoMapper;
using Flowtask.Business.DTOs.Auth;
using Flowtask.Business.DTOs.Users;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role.Name).ToList()));

        CreateMap<User, AuthUserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role.Name).ToList()))
            .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.UserRoles.Where(ur => ur.Role != null).SelectMany(ur => ur.Role.RolePermissions).Where(rp => rp.Permission != null).Select(rp => rp.Permission.Code).Distinct().ToList()));
    }
}

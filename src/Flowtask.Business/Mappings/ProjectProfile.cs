using AutoMapper;
using Flowtask.Business.DTOs.Projects;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class ProjectProfile : Profile
{
    public ProjectProfile()
    {
        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner != null ? src.Owner.FullName : string.Empty))
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members != null ? src.Members.Count : 0))
            .ForMember(dest => dest.IssueCount, opt => opt.MapFrom(src => src.Issues != null ? src.Issues.Count(i => !i.IsDeleted) : 0));

        CreateMap<Project, ProjectDetailDto>()
            .IncludeBase<Project, ProjectDto>()
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members ?? new List<ProjectMember>()));

        CreateMap<ProjectMember, ProjectMemberDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : string.Empty))
            .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarUrl : null))
            .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.User != null ? src.User.JobTitle : null));
    }
}

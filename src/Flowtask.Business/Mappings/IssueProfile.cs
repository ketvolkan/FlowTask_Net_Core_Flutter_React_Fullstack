using AutoMapper;
using Flowtask.EntityLayer.DTOs.Issues;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class IssueProfile : Profile
{
    public IssueProfile()
    {
        CreateMap<Issue, IssueDto>()
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project != null ? src.Project.Name : string.Empty))
            .ForMember(dest => dest.ProjectKey, opt => opt.MapFrom(src => src.Project != null ? src.Project.Key : string.Empty))
            .ForMember(dest => dest.ReporterName, opt => opt.MapFrom(src => src.Reporter != null ? src.Reporter.FullName : string.Empty))
            .ForMember(dest => dest.ReporterAvatarUrl, opt => opt.MapFrom(src => src.Reporter != null ? src.Reporter.AvatarUrl : null))
            .ForMember(dest => dest.AssigneeName, opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.FullName : null))
            .ForMember(dest => dest.AssigneeAvatarUrl, opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.AvatarUrl : null))
            .ForMember(dest => dest.SprintName, opt => opt.MapFrom(src => src.Sprint != null ? src.Sprint.Name : null))
            .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments != null ? src.Comments.Count(c => !c.IsDeleted) : 0))
            .ForMember(dest => dest.AttachmentCount, opt => opt.MapFrom(src => src.Attachments != null ? src.Attachments.Count : 0));
    }
}

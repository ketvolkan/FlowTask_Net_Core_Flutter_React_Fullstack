using AutoMapper;
using Flowtask.EntityLayer.DTOs.Sprints;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.Mappings;

public class SprintProfile : Profile
{
    public SprintProfile()
    {
        CreateMap<Sprint, SprintDto>()
            .ForMember(dest => dest.TotalIssues, opt => opt.MapFrom(src => src.Issues.Count(i => !i.IsDeleted)))
            .ForMember(dest => dest.CompletedIssues, opt => opt.MapFrom(src => src.Issues.Count(i => !i.IsDeleted && i.Status == IssueStatus.Done)))
            .ForMember(dest => dest.InProgressIssues, opt => opt.MapFrom(src => src.Issues.Count(i => !i.IsDeleted && i.Status == IssueStatus.InProgress)))
            .ForMember(dest => dest.TotalStoryPoints, opt => opt.MapFrom(src => src.Issues.Where(i => !i.IsDeleted && i.StoryPoints.HasValue).Sum(i => i.StoryPoints!.Value)))
            .ForMember(dest => dest.CompletedStoryPoints, opt => opt.MapFrom(src => src.Issues.Where(i => !i.IsDeleted && i.Status == IssueStatus.Done && i.StoryPoints.HasValue).Sum(i => i.StoryPoints!.Value)));

        CreateMap<Sprint, SprintDetailDto>()
            .ForMember(dest => dest.TotalStoryPoints, opt => opt.MapFrom(src => src.Issues.Where(i => !i.IsDeleted && i.StoryPoints.HasValue).Sum(i => i.StoryPoints!.Value)))
            .ForMember(dest => dest.CompletedStoryPoints, opt => opt.MapFrom(src => src.Issues.Where(i => !i.IsDeleted && i.Status == IssueStatus.Done && i.StoryPoints.HasValue).Sum(i => i.StoryPoints!.Value)))
            .ForMember(dest => dest.Issues, opt => opt.MapFrom(src => src.Issues.Where(i => !i.IsDeleted)));
    }
}

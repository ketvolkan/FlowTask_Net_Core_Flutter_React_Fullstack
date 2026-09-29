using AutoMapper;
using Flowtask.Business.DTOs.Attachments;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class AttachmentProfile : Profile
{
    public AttachmentProfile()
    {
        CreateMap<Attachment, AttachmentDto>()
            .ForMember(dest => dest.UploadedByName, opt => opt.MapFrom(src => src.UploadedBy.FullName));
    }
}

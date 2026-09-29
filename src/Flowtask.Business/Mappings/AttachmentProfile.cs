using AutoMapper;
using Flowtask.EntityLayer.DTOs.Attachments;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Mappings;

public class AttachmentProfile : Profile
{
    public AttachmentProfile()
    {
        CreateMap<Attachment, AttachmentDto>()
            .ForMember(dest => dest.UploadedByName, opt => opt.MapFrom(src => src.UploadedBy != null ? src.UploadedBy.FullName : string.Empty));
    }
}

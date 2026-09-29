using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfAttachmentDal : EfEntityRepositoryBase<Attachment, ApplicationDbContext>, IAttachmentDal
{
    public EfAttachmentDal(ApplicationDbContext context) : base(context)
    {
    }
}

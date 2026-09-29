using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfCommentDal : EfEntityRepositoryBase<Comment, ApplicationDbContext>, ICommentDal
{
    public EfCommentDal(ApplicationDbContext context) : base(context)
    {
    }
}

using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfPermissionDal : EfEntityRepositoryBase<Permission, ApplicationDbContext>, IPermissionDal
{
    public EfPermissionDal(ApplicationDbContext context) : base(context)
    {
    }
}

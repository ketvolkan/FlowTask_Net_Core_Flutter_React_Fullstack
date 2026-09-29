using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfActivityLogDal : EfEntityRepositoryBase<ActivityLog, ApplicationDbContext>, IActivityLogDal
{
    public EfActivityLogDal(ApplicationDbContext context) : base(context)
    {
    }
}

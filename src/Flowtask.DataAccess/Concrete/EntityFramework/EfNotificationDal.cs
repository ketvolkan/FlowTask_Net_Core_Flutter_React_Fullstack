using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfNotificationDal : EfEntityRepositoryBase<Notification, ApplicationDbContext>, INotificationDal
{
    public EfNotificationDal(ApplicationDbContext context) : base(context)
    {
    }
}

using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfSprintDal : EfEntityRepositoryBase<Sprint, ApplicationDbContext>, ISprintDal
{
    public EfSprintDal(ApplicationDbContext context) : base(context)
    {
    }
}

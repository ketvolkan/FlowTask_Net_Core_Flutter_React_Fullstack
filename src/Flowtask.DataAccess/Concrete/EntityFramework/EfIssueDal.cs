using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfIssueDal : EfEntityRepositoryBase<Issue, ApplicationDbContext>, IIssueDal
{
    public EfIssueDal(ApplicationDbContext context) : base(context)
    {
    }
}

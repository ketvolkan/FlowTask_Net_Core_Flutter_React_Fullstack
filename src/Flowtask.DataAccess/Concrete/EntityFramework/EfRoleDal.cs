using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfRoleDal : EfEntityRepositoryBase<Role, ApplicationDbContext>, IRoleDal
{
    public EfRoleDal(ApplicationDbContext context) : base(context)
    {
    }
}

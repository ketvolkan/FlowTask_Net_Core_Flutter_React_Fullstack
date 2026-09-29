using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfUserRoleDal : EfEntityRepositoryBase<UserRole, ApplicationDbContext>, IUserRoleDal
{
    public EfUserRoleDal(ApplicationDbContext context) : base(context)
    {
    }
}

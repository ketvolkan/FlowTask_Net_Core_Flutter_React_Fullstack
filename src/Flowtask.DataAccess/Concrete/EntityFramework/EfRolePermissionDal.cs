using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfRolePermissionDal : EfEntityRepositoryBase<RolePermission, ApplicationDbContext>, IRolePermissionDal
{
    public EfRolePermissionDal(ApplicationDbContext context) : base(context)
    {
    }
}

using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfRefreshTokenDal : EfEntityRepositoryBase<RefreshToken, ApplicationDbContext>, IRefreshTokenDal
{
    public EfRefreshTokenDal(ApplicationDbContext context) : base(context)
    {
    }
}

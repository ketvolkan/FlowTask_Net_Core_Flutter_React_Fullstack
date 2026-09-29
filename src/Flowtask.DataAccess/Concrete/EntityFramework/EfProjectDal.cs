using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfProjectDal : EfEntityRepositoryBase<Project, ApplicationDbContext>, IProjectDal
{
    public EfProjectDal(ApplicationDbContext context) : base(context)
    {
    }
}

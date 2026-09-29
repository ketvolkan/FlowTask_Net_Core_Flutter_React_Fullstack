using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfProjectMemberDal : EfEntityRepositoryBase<ProjectMember, ApplicationDbContext>, IProjectMemberDal
{
    public EfProjectMemberDal(ApplicationDbContext context) : base(context)
    {
    }
}

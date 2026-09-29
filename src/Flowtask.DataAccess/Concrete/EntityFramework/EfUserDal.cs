using Flowtask.Core.DataAccess.EntityFramework;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.DataAccess.Concrete.EntityFramework;

public class EfUserDal : EfEntityRepositoryBase<User, ApplicationDbContext>, IUserDal
{
    public EfUserDal(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<List<string>> GetRolesAsync(Guid userId)
    {
        return await Context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.Role.Name)
            .ToListAsync();
    }

    public async Task<List<string>> GetPermissionsAsync(Guid userId)
    {
        return await (from userRole in Context.UserRoles
                      join rolePermission in Context.RolePermissions on userRole.RoleId equals rolePermission.RoleId
                      where userRole.UserId == userId
                      select rolePermission.Permission.Code)
                     .Distinct()
                     .ToListAsync();
    }
}

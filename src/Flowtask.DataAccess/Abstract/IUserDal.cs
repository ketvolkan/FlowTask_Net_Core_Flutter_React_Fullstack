using Flowtask.Core.DataAccess;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Abstract;

public interface IUserDal : IEntityRepository<User>
{
    Task<List<string>> GetRolesAsync(Guid userId);
    Task<List<string>> GetPermissionsAsync(Guid userId);
}

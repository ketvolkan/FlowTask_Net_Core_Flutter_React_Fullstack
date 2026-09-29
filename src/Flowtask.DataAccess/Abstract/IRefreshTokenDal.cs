using Flowtask.Core.DataAccess;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.Abstract;

public interface IRefreshTokenDal : IEntityRepository<RefreshToken>
{
}

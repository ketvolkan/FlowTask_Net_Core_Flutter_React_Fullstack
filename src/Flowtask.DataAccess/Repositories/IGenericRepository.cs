using System.Linq.Expressions;
using Flowtask.EntityLayer.Common;

namespace Flowtask.DataAccess.Repositories;

public interface IGenericRepository<T> where T : BaseEntity
{
    IQueryable<T> Query(bool asNoTracking = false);
    Task<IReadOnlyList<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool asNoTracking = true, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(Expression<Func<T, bool>>? filter = null, int page = 1, int pageSize = 10, string? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool asNoTracking = true, CancellationToken cancellationToken = default);
    Task<T?> GetAsync(Expression<Func<T, bool>> filter, string? includeProperties = null, bool asNoTracking = true, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(Guid id, string? includeProperties = null, bool asNoTracking = true, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? filter = null, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    void Update(T entity);
    void UpdateRange(IEnumerable<T> entities);
    void Delete(T entity);
    void DeleteRange(IEnumerable<T> entities);
    Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

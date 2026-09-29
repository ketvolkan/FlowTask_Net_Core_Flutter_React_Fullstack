using System.Linq.Expressions;
using Flowtask.Core.Entities;

namespace Flowtask.Core.DataAccess;

public interface IEntityRepository<T> where T : class, IEntity, new()
{
    T? Get(Expression<Func<T, bool>> filter, string? includeProperties = null, bool asNoTracking = false);
    Task<T?> GetAsync(Expression<Func<T, bool>> filter, string? includeProperties = null, bool asNoTracking = false, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(Guid id, string? includeProperties = null, bool asNoTracking = false, CancellationToken cancellationToken = default);
    IList<T> GetList(Expression<Func<T, bool>>? filter = null, string? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool asNoTracking = false);
    Task<IList<T>> GetListAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool asNoTracking = false, CancellationToken cancellationToken = default);
    Task<(IList<T> Items, int TotalCount)> GetPagedAsync(Expression<Func<T, bool>>? filter = null, int page = 1, int pageSize = 10, string? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool asNoTracking = false, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? filter = null, CancellationToken cancellationToken = default);
    void Add(T entity);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    void Update(T entity);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    void UpdateRange(IEnumerable<T> entities);
    void Delete(T entity);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    void DeleteRange(IEnumerable<T> entities);
    Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
    IQueryable<T> Query(bool asNoTracking = false);
}

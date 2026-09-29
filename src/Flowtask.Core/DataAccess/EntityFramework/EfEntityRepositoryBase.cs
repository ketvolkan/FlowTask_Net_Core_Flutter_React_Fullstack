using System.Linq.Expressions;
using Flowtask.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Core.DataAccess.EntityFramework;

public class EfEntityRepositoryBase<TEntity, TContext> : IEntityRepository<TEntity>
    where TEntity : class, IEntity, new()
    where TContext : DbContext
{
    protected readonly TContext Context;
    protected readonly DbSet<TEntity> DbSet;

    public EfEntityRepositoryBase(TContext context)
    {
        Context = context;
        DbSet = Context.Set<TEntity>();
    }

    public virtual IQueryable<TEntity> Query(bool asNoTracking = false)
    {
        return asNoTracking ? DbSet.AsNoTracking() : DbSet.AsQueryable();
    }

    public virtual TEntity? Get(Expression<Func<TEntity, bool>> filter, string? includeProperties = null, bool asNoTracking = false)
    {
        var query = Query(asNoTracking);
        query = ApplyIncludes(query, includeProperties);
        return query.FirstOrDefault(filter);
    }

    public virtual async Task<TEntity?> GetAsync(Expression<Func<TEntity, bool>> filter, string? includeProperties = null, bool asNoTracking = false, CancellationToken cancellationToken = default)
    {
        var query = Query(asNoTracking);
        query = ApplyIncludes(query, includeProperties);
        return await query.FirstOrDefaultAsync(filter, cancellationToken);
    }

    public virtual async Task<TEntity?> GetByIdAsync(Guid id, string? includeProperties = null, bool asNoTracking = false, CancellationToken cancellationToken = default)
    {
        var query = Query(asNoTracking);
        query = ApplyIncludes(query, includeProperties);
        return await query.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id, cancellationToken);
    }

    public virtual IList<TEntity> GetList(Expression<Func<TEntity, bool>>? filter = null, string? includeProperties = null, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null, bool asNoTracking = false)
    {
        var query = Query(asNoTracking);
        if (filter != null) query = query.Where(filter);
        query = ApplyIncludes(query, includeProperties);
        if (orderBy != null) query = orderBy(query);
        return query.ToList();
    }

    public virtual async Task<IList<TEntity>> GetListAsync(Expression<Func<TEntity, bool>>? filter = null, string? includeProperties = null, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null, bool asNoTracking = false, CancellationToken cancellationToken = default)
    {
        var query = Query(asNoTracking);
        if (filter != null) query = query.Where(filter);
        query = ApplyIncludes(query, includeProperties);
        if (orderBy != null) query = orderBy(query);
        return await query.ToListAsync(cancellationToken);
    }

    public virtual async Task<(IList<TEntity> Items, int TotalCount)> GetPagedAsync(Expression<Func<TEntity, bool>>? filter = null, int page = 1, int pageSize = 10, string? includeProperties = null, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null, bool asNoTracking = false, CancellationToken cancellationToken = default)
    {
        var query = Query(asNoTracking);
        if (filter != null) query = query.Where(filter);
        query = ApplyIncludes(query, includeProperties);

        var totalCount = await query.CountAsync(cancellationToken);

        if (orderBy != null)
        {
            query = orderBy(query);
        }

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> filter, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(filter, cancellationToken);
    }

    public virtual async Task<bool> AnyAsync(Expression<Func<TEntity, bool>> filter, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(filter, cancellationToken);
    }

    public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>>? filter = null, CancellationToken cancellationToken = default)
    {
        return filter == null
            ? await DbSet.CountAsync(cancellationToken)
            : await DbSet.CountAsync(filter, cancellationToken);
    }

    public virtual void Add(TEntity entity)
    {
        var addedEntity = Context.Entry(entity);
        addedEntity.State = EntityState.Added;
        Context.SaveChanges();
    }

    public virtual async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
    }

    public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        await DbSet.AddRangeAsync(entities, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
    }

    public virtual void Update(TEntity entity)
    {
        var updatedEntity = Context.Entry(entity);
        updatedEntity.State = EntityState.Modified;
        Context.SaveChanges();
    }

    public virtual async Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        var updatedEntity = Context.Entry(entity);
        updatedEntity.State = EntityState.Modified;
        await Context.SaveChangesAsync(cancellationToken);
    }

    public virtual void UpdateRange(IEnumerable<TEntity> entities)
    {
        DbSet.UpdateRange(entities);
        Context.SaveChanges();
    }

    public virtual void Delete(TEntity entity)
    {
        var deletedEntity = Context.Entry(entity);
        deletedEntity.State = EntityState.Deleted;
        Context.SaveChanges();
    }

    public virtual async Task DeleteAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        var deletedEntity = Context.Entry(entity);
        deletedEntity.State = EntityState.Deleted;
        await Context.SaveChangesAsync(cancellationToken);
    }

    public virtual void DeleteRange(IEnumerable<TEntity> entities)
    {
        DbSet.RemoveRange(entities);
        Context.SaveChanges();
    }

    public virtual async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await DbSet.FindAsync([id], cancellationToken: cancellationToken);
        if (entity != null)
        {
            var isSoftDeletable = entity.GetType().GetProperty("IsDeleted");
            var deletedAtProp = entity.GetType().GetProperty("DeletedAt");
            if (isSoftDeletable != null && isSoftDeletable.CanWrite)
            {
                isSoftDeletable.SetValue(entity, true);
                if (deletedAtProp != null && deletedAtProp.CanWrite)
                {
                    deletedAtProp.SetValue(entity, DateTime.UtcNow);
                }
                await UpdateAsync(entity, cancellationToken);
            }
            else
            {
                await DeleteAsync(entity, cancellationToken);
            }
        }
    }

    private static IQueryable<TEntity> ApplyIncludes(IQueryable<TEntity> query, string? includeProperties)
    {
        if (string.IsNullOrWhiteSpace(includeProperties)) return query;

        var properties = includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var property in properties)
        {
            query = query.Include(property);
        }

        return query;
    }
}

using Flowtask.DataAccess.Context;
using Flowtask.DataAccess.Repositories;
using Flowtask.EntityLayer.Common;
using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace Flowtask.DataAccess.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;
    private readonly Dictionary<Type, object> _repositories = new();

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IGenericRepository<User> Users => Repository<User>();
    public IGenericRepository<Role> Roles => Repository<Role>();
    public IGenericRepository<Permission> Permissions => Repository<Permission>();
    public IGenericRepository<UserRole> UserRoles => Repository<UserRole>();
    public IGenericRepository<RolePermission> RolePermissions => Repository<RolePermission>();
    public IGenericRepository<RefreshToken> RefreshTokens => Repository<RefreshToken>();
    public IGenericRepository<Project> Projects => Repository<Project>();
    public IGenericRepository<ProjectMember> ProjectMembers => Repository<ProjectMember>();
    public IGenericRepository<Issue> Issues => Repository<Issue>();
    public IGenericRepository<Sprint> Sprints => Repository<Sprint>();
    public IGenericRepository<Comment> Comments => Repository<Comment>();
    public IGenericRepository<Attachment> Attachments => Repository<Attachment>();
    public IGenericRepository<Notification> Notifications => Repository<Notification>();
    public IGenericRepository<ActivityLog> ActivityLogs => Repository<ActivityLog>();

    public IGenericRepository<T> Repository<T>() where T : BaseEntity
    {
        var type = typeof(T);
        if (!_repositories.TryGetValue(type, out var repository))
        {
            repository = new GenericRepository<T>(_context);
            _repositories[type] = repository;
        }
        return (IGenericRepository<T>)repository;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
        }
        await _context.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}

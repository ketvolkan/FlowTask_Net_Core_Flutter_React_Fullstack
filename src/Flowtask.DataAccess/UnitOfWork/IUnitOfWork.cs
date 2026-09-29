using Flowtask.DataAccess.Repositories;
using Flowtask.EntityLayer.Common;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.DataAccess.UnitOfWork;

public interface IUnitOfWork : IAsyncDisposable
{
    IGenericRepository<T> Repository<T>() where T : BaseEntity;
    IGenericRepository<User> Users { get; }
    IGenericRepository<Role> Roles { get; }
    IGenericRepository<Permission> Permissions { get; }
    IGenericRepository<UserRole> UserRoles { get; }
    IGenericRepository<RolePermission> RolePermissions { get; }
    IGenericRepository<RefreshToken> RefreshTokens { get; }
    IGenericRepository<Project> Projects { get; }
    IGenericRepository<ProjectMember> ProjectMembers { get; }
    IGenericRepository<Issue> Issues { get; }
    IGenericRepository<Sprint> Sprints { get; }
    IGenericRepository<Comment> Comments { get; }
    IGenericRepository<Attachment> Attachments { get; }
    IGenericRepository<Notification> Notifications { get; }
    IGenericRepository<ActivityLog> ActivityLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}

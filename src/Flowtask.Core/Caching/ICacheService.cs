namespace Flowtask.Core.Caching;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
}

public static class CacheKeys
{
    public static string UserPermissions(Guid userId) => $"user:{userId}:permissions";
    public static string UserRoles(Guid userId) => $"user:{userId}:roles";
    public static string ProjectMeta(Guid projectId) => $"project:{projectId}:meta";
    public static string ProjectMembers(Guid projectId) => $"project:{projectId}:members";
    public static string SystemStats() => "stats:system:summary";
}

using FluentValidation;
using Flowtask.Business.Abstract;
using Flowtask.Business.Concrete;
using Flowtask.Business.Mappings;
using Flowtask.Business.ValidationRules.FluentValidation;
using Flowtask.Core.Caching;
using Flowtask.Core.Security;
using Flowtask.DataAccess.Abstract;
using Flowtask.DataAccess.Concrete.EntityFramework;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace Flowtask.Business;

public static class DependencyInjection
{
    public static IServiceCollection AddFlowtaskBusiness(this IServiceCollection services, IConfiguration configuration)
    {
        // Core Security
        services.Configure<TokenOptions>(configuration.GetSection("TokenOptions"));
        services.AddScoped<ITokenHelper, JwtTokenHelper>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Cache Configuration
        var redisConn = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConn))
        {
            try
            {
                var multiplexer = ConnectionMultiplexer.Connect(redisConn);
                services.AddSingleton<IConnectionMultiplexer>(multiplexer);
                services.AddScoped<ICacheService, RedisCacheService>();
            }
            catch
            {
                services.AddSingleton<ICacheService, MemoryCacheService>();
            }
        }
        else
        {
            services.AddSingleton<ICacheService, MemoryCacheService>();
        }

        // Data Access Layer (DALs)
        services.AddScoped<IUserDal, EfUserDal>();
        services.AddScoped<IRoleDal, EfRoleDal>();
        services.AddScoped<IPermissionDal, EfPermissionDal>();
        services.AddScoped<IUserRoleDal, EfUserRoleDal>();
        services.AddScoped<IRolePermissionDal, EfRolePermissionDal>();
        services.AddScoped<IRefreshTokenDal, EfRefreshTokenDal>();
        services.AddScoped<IProjectDal, EfProjectDal>();
        services.AddScoped<IProjectMemberDal, EfProjectMemberDal>();
        services.AddScoped<IIssueDal, EfIssueDal>();
        services.AddScoped<ISprintDal, EfSprintDal>();
        services.AddScoped<ICommentDal, EfCommentDal>();
        services.AddScoped<IAttachmentDal, EfAttachmentDal>();
        services.AddScoped<INotificationDal, EfNotificationDal>();
        services.AddScoped<IActivityLogDal, EfActivityLogDal>();

        // Business Managers / Services
        services.AddScoped<IAuthService, AuthManager>();
        services.AddScoped<IUserService, UserManager>();
        services.AddScoped<IProjectService, ProjectManager>();
        services.AddScoped<IProjectMemberService, ProjectMemberManager>();
        services.AddScoped<IIssueService, IssueManager>();
        services.AddScoped<ISprintService, SprintManager>();
        services.AddScoped<ICommentService, CommentManager>();
        services.AddScoped<IAttachmentService, AttachmentManager>();
        services.AddScoped<INotificationDispatcher, NullNotificationDispatcher>();
        services.AddScoped<INotificationService, NotificationManager>();
        services.AddScoped<IActivityLogService, ActivityLogManager>();
        services.AddScoped<IAdminService, AdminManager>();

        // AutoMapper
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<UserProfile>();
            cfg.AddProfile<ProjectProfile>();
            cfg.AddProfile<IssueProfile>();
            cfg.AddProfile<SprintProfile>();
            cfg.AddProfile<CommentProfile>();
            cfg.AddProfile<AttachmentProfile>();
            cfg.AddProfile<NotificationProfile>();
            cfg.AddProfile<ActivityLogProfile>();
        });

        // FluentValidation
        services.AddValidatorsFromAssemblyContaining<UserForLoginDtoValidator>();

        return services;
    }
}

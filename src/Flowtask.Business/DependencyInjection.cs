using FluentValidation;
using Flowtask.Business.Interfaces;
using Flowtask.Business.Mappings;
using Flowtask.Business.Services;
using Flowtask.Business.ValidationRules;
using Flowtask.Core.Caching;
using Flowtask.Core.Security;
using Flowtask.DataAccess.Context;
using Flowtask.DataAccess.Repositories;
using Flowtask.DataAccess.UnitOfWork;
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

        // Data Access
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Business Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IProjectMemberService, ProjectMemberService>();
        services.AddScoped<IIssueService, IssueService>();
        services.AddScoped<ISprintService, SprintService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();
        services.AddScoped<IAdminService, AdminService>();

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
        services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

        return services;
    }
}

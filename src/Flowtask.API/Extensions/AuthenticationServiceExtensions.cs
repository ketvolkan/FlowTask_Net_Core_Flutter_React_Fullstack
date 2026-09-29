using System.Text;
using Flowtask.Core.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Flowtask.API.Extensions;

public static class AuthenticationServiceExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var tokenOptions = configuration.GetSection("TokenOptions").Get<TokenOptions>()
            ?? new TokenOptions { SecurityKey = "flowtask_super_secret_security_key_2026_default_key_xyz_12345" };

        var key = Encoding.UTF8.GetBytes(tokenOptions.SecurityKey);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = !string.IsNullOrEmpty(tokenOptions.Issuer),
                ValidIssuer = tokenOptions.Issuer,
                ValidateAudience = !string.IsNullOrEmpty(tokenOptions.Audience),
                ValidAudience = tokenOptions.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireSystemAdmin", policy =>
                policy.RequireClaim("is_system_admin", "true"));
        });

        return services;
    }
}

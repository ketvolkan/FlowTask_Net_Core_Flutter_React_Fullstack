using Microsoft.OpenApi;

namespace Flowtask.API.Extensions;

public static class SwaggerServiceExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Flowtask API",
                Version = "v1",
                Description = "Flowtask - Modern Project Management & Issue Tracking API (ASP.NET Core 10)"
            });

            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            };

            c.AddSecurityDefinition("Bearer", securityScheme);

            c.AddSecurityRequirement((document) =>
            {
                var req = new OpenApiSecurityRequirement();
                req.Add(new OpenApiSecuritySchemeReference("Bearer", document), new List<string>());
                return req;
            });
        });

        return services;
    }
}

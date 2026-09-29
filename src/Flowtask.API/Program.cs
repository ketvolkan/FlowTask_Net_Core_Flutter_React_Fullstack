using Flowtask.API.Extensions;
using Flowtask.API.Middlewares;
using Flowtask.Business;
using Flowtask.Core.Security;
using Flowtask.DataAccess.Context;
using Flowtask.DataAccess.Seed;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, config) =>
{
    config.ReadFrom.Configuration(context.Configuration)
          .Enrich.FromLogContext()
          .WriteTo.Console();
});

// Configure Database
var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "Sqlite";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (dbProvider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
    {
        var connectionString = builder.Configuration.GetConnectionString("PostgreSql")
            ?? "Host=localhost;Port=5432;Database=flowtask_db;Username=postgres;Password=postgres";
        options.UseNpgsql(connectionString, b => b.MigrationsAssembly("Flowtask.DataAccess"));
    }
    else
    {
        var connectionString = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=flowtask.db";
        options.UseSqlite(connectionString, b => b.MigrationsAssembly("Flowtask.DataAccess"));
    }
});

// Register Business & DataAccess Layers
builder.Services.AddFlowtaskBusiness(builder.Configuration);

// Register JWT Authentication & Authorization
builder.Services.AddJwtAuthentication(builder.Configuration);

// Register Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerDocumentation();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApps", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

var app = builder.Build();

// Migrate and Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();

        if (context.Database.IsNpgsql())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        await DatabaseSeeder.SeedAsync(context, passwordHasher);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not automatically migrate or seed database on startup: {Message}", ex.Message);
    }
}

// Middlewares
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Flowtask API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}

app.UseCors("AllowClientApps");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// For IntegrationTests WebApplicationFactory
public partial class Program { }

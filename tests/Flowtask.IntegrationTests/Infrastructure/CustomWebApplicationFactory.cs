using Flowtask.Core.Security;
using Flowtask.DataAccess.Context;
using Flowtask.DataAccess.Seed;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace Flowtask.IntegrationTests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "FlowtaskTestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var dbContextDescriptors = services.Where(
                d => d.ServiceType == typeof(DbContextOptions) ||
                     d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                     d.ServiceType == typeof(ApplicationDbContext) ||
                     (d.ServiceType.FullName != null && d.ServiceType.FullName.StartsWith("Microsoft.EntityFrameworkCore")) ||
                     (d.ServiceType.FullName != null && d.ServiceType.FullName.StartsWith("Npgsql.EntityFrameworkCore"))
            ).ToList();

            foreach (var descriptor in dbContextDescriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_dbName);
                options.ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning));
            });

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<ApplicationDbContext>();
            var hasher = scopedServices.GetRequiredService<IPasswordHasher>();

            db.Database.EnsureCreated();
            DatabaseSeeder.SeedAsync(db, hasher).GetAwaiter().GetResult();
        });
    }
}

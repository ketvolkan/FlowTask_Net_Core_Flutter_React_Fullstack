using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Flowtask.DataAccess.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Key).IsRequired().HasMaxLength(10);
        builder.Property(p => p.Description).HasMaxLength(1000);
        builder.Property(p => p.AvatarUrl).HasMaxLength(500);

        builder.HasOne(p => p.Owner)
            .WithMany(u => u.OwnedProjects)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.Key).IsUnique();
        builder.HasIndex(p => p.OwnerId);
        builder.HasIndex(p => p.IsArchived);
        builder.HasIndex(p => p.IsDeleted);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}

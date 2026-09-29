using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Flowtask.DataAccess.Configurations;

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.ToTable("ActivityLogs");
        builder.HasKey(al => al.Id);

        builder.Property(al => al.Action).IsRequired().HasMaxLength(100);
        builder.Property(al => al.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(al => al.EntityId).IsRequired().HasMaxLength(100);
        builder.Property(al => al.Details).HasMaxLength(2000);
        builder.Property(al => al.IpAddress).HasMaxLength(50);

        builder.HasOne(al => al.User)
            .WithMany(u => u.ActivityLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(al => al.Project)
            .WithMany(p => p.ActivityLogs)
            .HasForeignKey(al => al.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(al => al.UserId);
        builder.HasIndex(al => al.ProjectId);
        builder.HasIndex(al => al.CreatedAt);
        builder.HasIndex(al => new { al.EntityType, al.EntityId });
    }
}

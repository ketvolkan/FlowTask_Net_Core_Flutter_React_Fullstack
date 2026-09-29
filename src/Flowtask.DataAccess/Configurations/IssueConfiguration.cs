using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Flowtask.DataAccess.Configurations;

public class IssueConfiguration : IEntityTypeConfiguration<Issue>
{
    public void Configure(EntityTypeBuilder<Issue> builder)
    {
        builder.ToTable("Issues");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.IssueKey).IsRequired().HasMaxLength(20);
        builder.Property(i => i.Title).IsRequired().HasMaxLength(250);
        builder.Property(i => i.Description).HasMaxLength(10000);

        builder.HasOne(i => i.Project)
            .WithMany(p => p.Issues)
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Reporter)
            .WithMany(u => u.ReportedIssues)
            .HasForeignKey(i => i.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Assignee)
            .WithMany(u => u.AssignedIssues)
            .HasForeignKey(i => i.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(i => i.Sprint)
            .WithMany(s => s.Issues)
            .HasForeignKey(i => i.SprintId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(i => new { i.ProjectId, i.IssueKey }).IsUnique();
        builder.HasIndex(i => new { i.ProjectId, i.Status });
        builder.HasIndex(i => i.AssigneeId);
        builder.HasIndex(i => i.SprintId);
        builder.HasIndex(i => i.IsDeleted);

        builder.HasQueryFilter(i => !i.IsDeleted);
    }
}

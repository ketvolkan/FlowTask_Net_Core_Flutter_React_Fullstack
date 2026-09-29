using Flowtask.Core.Security;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.DataAccess.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        // 1. Seed Permissions
        var permissions = GetPermissions();
        foreach (var perm in permissions)
        {
            if (!await context.Permissions.AnyAsync(p => p.Code == perm.Code))
            {
                await context.Permissions.AddAsync(perm);
            }
        }
        await context.SaveChangesAsync();

        // 2. Seed Roles
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "SystemAdmin");
        if (adminRole == null)
        {
            adminRole = new Role
            {
                Name = "SystemAdmin",
                Description = "Flowtask Platform Super Administrator",
                IsSystemRole = true
            };
            await context.Roles.AddAsync(adminRole);
            await context.SaveChangesAsync();
        }

        var userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            userRole = new Role
            {
                Name = "User",
                Description = "Standard Flowtask User",
                IsSystemRole = true
            };
            await context.Roles.AddAsync(userRole);
            await context.SaveChangesAsync();
        }

        // Assign all permissions to SystemAdmin
        var allDbPermissions = await context.Permissions.ToListAsync();
        foreach (var perm in allDbPermissions)
        {
            if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id))
            {
                await context.RolePermissions.AddAsync(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = perm.Id
                });
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed Default System Admin User
        var adminEmail = "admin@flowtask.com";
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (existingAdmin == null)
        {
            var adminUser = new User
            {
                FullName = "System Administrator",
                Email = adminEmail,
                PasswordHash = passwordHasher.HashPassword("Admin123*"),
                JobTitle = "Platform SuperAdmin",
                IsActive = true,
                IsSystemAdmin = true
            };
            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            await context.UserRoles.AddAsync(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });
            await context.SaveChangesAsync();
        }

        // 4. Seed Demo User
        var demoEmail = "demo@flowtask.com";
        var existingDemo = await context.Users.FirstOrDefaultAsync(u => u.Email == demoEmail);
        if (existingDemo == null)
        {
            var demoUser = new User
            {
                FullName = "Demo Project Manager",
                Email = demoEmail,
                PasswordHash = passwordHasher.HashPassword("Demo123*"),
                JobTitle = "Lead Project Manager",
                IsActive = true,
                IsSystemAdmin = false
            };
            await context.Users.AddAsync(demoUser);
            await context.SaveChangesAsync();

            await context.UserRoles.AddAsync(new UserRole
            {
                UserId = demoUser.Id,
                RoleId = userRole.Id
            });
            await context.SaveChangesAsync();
        }
    }

    private static List<Permission> GetPermissions()
    {
        return new List<Permission>
        {
            // System Admin Permissions
            new() { Code = "admin.users.read", Group = "Admin", Description = "View all users in the system" },
            new() { Code = "admin.users.create", Group = "Admin", Description = "Create new users" },
            new() { Code = "admin.users.update", Group = "Admin", Description = "Update user details and status" },
            new() { Code = "admin.users.delete", Group = "Admin", Description = "Delete or deactivate users" },
            new() { Code = "admin.roles.manage", Group = "Admin", Description = "Manage roles and system permissions" },
            new() { Code = "admin.projects.read", Group = "Admin", Description = "View all projects in the system" },
            new() { Code = "admin.projects.delete", Group = "Admin", Description = "Delete or archive any project" },
            new() { Code = "admin.statistics.read", Group = "Admin", Description = "View platform global statistics" },
            new() { Code = "admin.activitylogs.read", Group = "Admin", Description = "View global audit logs" },

            // Project Permissions
            new() { Code = "project.create", Group = "Project", Description = "Create new projects" },
            new() { Code = "project.read", Group = "Project", Description = "View project details and dashboard" },
            new() { Code = "project.update", Group = "Project", Description = "Update project settings" },
            new() { Code = "project.delete", Group = "Project", Description = "Delete or archive project" },
            new() { Code = "project.members.read", Group = "Project", Description = "View project members" },
            new() { Code = "project.members.add", Group = "Project", Description = "Invite or add members to project" },
            new() { Code = "project.members.update", Group = "Project", Description = "Update project member role" },
            new() { Code = "project.members.remove", Group = "Project", Description = "Remove members from project" },

            // Issue Permissions
            new() { Code = "issue.create", Group = "Issue", Description = "Create new tasks/issues" },
            new() { Code = "issue.read", Group = "Issue", Description = "View issue details" },
            new() { Code = "issue.update", Group = "Issue", Description = "Update issue fields" },
            new() { Code = "issue.delete", Group = "Issue", Description = "Delete issue" },
            new() { Code = "issue.assign", Group = "Issue", Description = "Assign issues to members" },
            new() { Code = "issue.status.update", Group = "Issue", Description = "Change issue workflow status" },

            // Sprint Permissions
            new() { Code = "sprint.read", Group = "Sprint", Description = "View sprints and backlog" },
            new() { Code = "sprint.create", Group = "Sprint", Description = "Create new sprint" },
            new() { Code = "sprint.update", Group = "Sprint", Description = "Start, complete or edit sprint" },
            new() { Code = "sprint.delete", Group = "Sprint", Description = "Delete sprint" },

            // Comment & Attachment Permissions
            new() { Code = "comment.create", Group = "Comment", Description = "Post comments on issues" },
            new() { Code = "comment.update.own", Group = "Comment", Description = "Edit own comments" },
            new() { Code = "comment.delete.own", Group = "Comment", Description = "Delete own comments" },
            new() { Code = "comment.delete.any", Group = "Comment", Description = "Delete any comment (Admin)" },
            new() { Code = "attachment.upload", Group = "Attachment", Description = "Upload file attachments" },
            new() { Code = "attachment.delete", Group = "Attachment", Description = "Delete file attachments" },

            // Notification Permissions
            new() { Code = "notification.read", Group = "Notification", Description = "View and manage own notifications" }
        };
    }
}

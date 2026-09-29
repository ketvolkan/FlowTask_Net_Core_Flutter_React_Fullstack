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

        // 5. Seed Starter Project
        var starterProject = await context.Projects.FirstOrDefaultAsync(p => p.Key == "FLOW");
        if (starterProject == null)
        {
            var adminUser = await context.Users.FirstAsync(u => u.Email == adminEmail);
            var demoUser = await context.Users.FirstAsync(u => u.Email == demoEmail);

            starterProject = new Project
            {
                Name = "Flowtask Core Platform",
                Key = "FLOW",
                Description = "Primary workspace for Flowtask issue tracking and sprint management.",
                OwnerId = adminUser.Id,
                IsArchived = false
            };
            await context.Projects.AddAsync(starterProject);
            await context.SaveChangesAsync();

            // Add members
            await context.ProjectMembers.AddAsync(new ProjectMember
            {
                ProjectId = starterProject.Id,
                UserId = adminUser.Id,
                Role = ProjectRoleType.Owner
            });
            await context.ProjectMembers.AddAsync(new ProjectMember
            {
                ProjectId = starterProject.Id,
                UserId = demoUser.Id,
                Role = ProjectRoleType.Admin
            });
            await context.SaveChangesAsync();

            // 6. Seed Sprint
            var sprint1 = new Sprint
            {
                ProjectId = starterProject.Id,
                Name = "Sprint 1 — Core MVP",
                Goal = "Deliver Authentication, Kanban Board, and Backlog modules.",
                Status = SprintStatus.Active,
                StartDate = DateTime.UtcNow.AddDays(-3),
                EndDate = DateTime.UtcNow.AddDays(11)
            };
            await context.Sprints.AddAsync(sprint1);
            await context.SaveChangesAsync();

            // 7. Seed Issues
            var issues = new List<Issue>
            {
                new()
                {
                    ProjectId = starterProject.Id,
                    SprintId = sprint1.Id,
                    ReporterId = adminUser.Id,
                    AssigneeId = adminUser.Id,
                    IssueKey = "FLOW-1",
                    Title = "Implement JWT authentication & refresh token flow",
                    Description = "Secure API endpoints with JWT tokens and automatic silent refresh.",
                    Type = IssueType.Story,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Done,
                    StoryPoints = 5,
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = starterProject.Id,
                    SprintId = sprint1.Id,
                    ReporterId = adminUser.Id,
                    AssigneeId = demoUser.Id,
                    IssueKey = "FLOW-2",
                    Title = "Design and build interactive Kanban Board",
                    Description = "Support drag-and-drop between Todo, InProgress, InReview, and Done columns.",
                    Type = IssueType.Task,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.InProgress,
                    StoryPoints = 8,
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = starterProject.Id,
                    SprintId = sprint1.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = adminUser.Id,
                    IssueKey = "FLOW-3",
                    Title = "Create Sprint & Backlog planning view",
                    Description = "Enable creation, starting, and completing sprints with real-time progress.",
                    Type = IssueType.Story,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 5,
                    OrderIndex = 3
                },
                new()
                {
                    ProjectId = starterProject.Id,
                    ReporterId = adminUser.Id,
                    IssueKey = "FLOW-4",
                    Title = "Add Flutter Mobile integration with BLoC",
                    Description = "Connect Flutter Clean Architecture clients to ASP.NET Core API.",
                    Type = IssueType.Epic,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 13,
                    OrderIndex = 4
                }
            };
            await context.Issues.AddRangeAsync(issues);
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

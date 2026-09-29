namespace Flowtask.Business.Constants;

public static class Messages
{
    // Auth & Users
    public const string UserRegistered = "User successfully registered.";
    public const string UserAlreadyExists = "A user with this email address already exists.";
    public const string UserNotFound = "User not found.";
    public const string PasswordError = "Incorrect password.";
    public const string SuccessfulLogin = "Login successful.";
    public const string AccessTokenCreated = "Access token successfully created.";
    public const string InvalidRefreshToken = "Invalid or expired refresh token.";
    public const string TokenRefreshed = "Token successfully refreshed.";
    public const string UserProfileUpdated = "User profile updated successfully.";
    public const string PasswordChanged = "Password changed successfully.";
    public const string UserCreated = "User created successfully.";
    public const string UserUpdated = "User updated successfully.";
    public const string UserDeleted = "User deleted successfully.";

    // Projects
    public const string ProjectCreated = "Project created successfully.";
    public const string ProjectUpdated = "Project updated successfully.";
    public const string ProjectDeleted = "Project deleted successfully.";
    public const string ProjectNotFound = "Project not found.";
    public const string ProjectKeyExists = "A project with this key already exists.";
    public const string ProjectMemberAdded = "Project member added successfully.";
    public const string ProjectMemberRemoved = "Project member removed successfully.";
    public const string ProjectMemberUpdated = "Project member role updated successfully.";
    public const string MemberAlreadyExists = "User is already a member of this project.";
    public const string MemberNotFound = "Project member not found.";

    // Issues
    public const string IssueCreated = "Issue created successfully.";
    public const string IssueUpdated = "Issue updated successfully.";
    public const string IssueDeleted = "Issue deleted successfully.";
    public const string IssueNotFound = "Issue not found.";
    public const string IssueAssigned = "Issue assigned successfully.";
    public const string IssueStatusUpdated = "Issue status updated successfully.";

    // Sprints
    public const string SprintCreated = "Sprint created successfully.";
    public const string SprintUpdated = "Sprint updated successfully.";
    public const string SprintDeleted = "Sprint deleted successfully.";
    public const string SprintNotFound = "Sprint not found.";
    public const string SprintAlreadyActive = "Another sprint is already active in this project.";

    // Comments & Attachments
    public const string CommentAdded = "Comment added successfully.";
    public const string CommentUpdated = "Comment updated successfully.";
    public const string CommentDeleted = "Comment deleted successfully.";
    public const string CommentNotFound = "Comment not found.";
    public const string AttachmentUploaded = "Attachment uploaded successfully.";
    public const string AttachmentDeleted = "Attachment deleted successfully.";
    public const string AttachmentNotFound = "Attachment not found.";

    // Notifications
    public const string NotificationNotFound = "Notification not found.";
    public const string NotificationMarkedAsRead = "Notification marked as read.";
    public const string AllNotificationsMarkedAsRead = "All notifications marked as read.";

    // Authorization & System
    public const string AuthorizationDenied = "You are not authorized to perform this operation.";
}

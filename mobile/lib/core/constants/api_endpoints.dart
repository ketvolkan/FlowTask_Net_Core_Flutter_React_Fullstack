class ApiEndpoints {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android Emulator alias for localhost
  static const String webBaseUrl = 'http://localhost:5000/api';
  
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh-token';
  static const String me = '/auth/me';
  
  // Projects
  static const String projects = '/projects';
  static String projectById(String id) => '/projects/$id';
  static String projectMembers(String id) => '/projects/$id/members';
  
  // Issues
  static const String issues = '/issues';
  static String issueById(String id) => '/issues/$id';
  static String issueStatus(String id) => '/issues/$id/status';
  // Comments (Note: backend uses /comments/issue/{id}, not /issues/{id}/comments)
  static String issueComments(String issueId) => '/comments/issue/$issueId';
  static String commentById(String id) => '/comments/$id';
  static String issueAttachments(String id) => '/issues/$id/attachments';
  
  // Sprints
  static const String sprints = '/sprints';
  static String sprintById(String id) => '/sprints/$id';
  static String sprintStart(String id) => '/sprints/$id/start';
  static String sprintComplete(String id) => '/sprints/$id/complete';
  
  // Notifications
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) => '/notifications/$id/read';
  static const String markAllNotificationsRead = '/notifications/read-all';
}

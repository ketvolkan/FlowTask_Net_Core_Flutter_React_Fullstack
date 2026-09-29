export type IssueStatus = 'Todo' | 'InProgress' | 'InReview' | 'Done';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type IssueType = 'Task' | 'Bug' | 'Story' | 'Epic';
export type SprintStatus = 'Planned' | 'Active' | 'Completed';
export type ProjectRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  isActive: boolean;
  isSystemAdmin?: boolean;
  roles?: string[];
  permissions?: string[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  isSystemAdmin: boolean;
  roles: string[];
  permissions: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  ownerName: string;
  isArchived: boolean;
  memberCount: number;
  issueCount: number;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  members: ProjectMember[];
  totalIssues: number;
  openIssues: number;
  doneIssues: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userAvatarUrl?: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface Issue {
  id: string;
  projectId: string;
  projectName?: string;
  key: string;
  title: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  reporterId: string;
  reporterName?: string;
  reporterAvatarUrl?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  sprintId?: string;
  sprintName?: string;
  storyPoints?: number;
  dueDate?: string;
  order: number;
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt?: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  issueCount: number;
  completedIssueCount: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  createdAt: string;
}

export interface SprintDetail extends Sprint {
  issues: Issue[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  issueId: string;
  uploadedById: string;
  uploadedByName: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'IssueAssigned' | 'IssueCommented' | 'SprintStarted' | 'ProjectInvitation' | 'System';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userFullName?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  projectId?: string;
  createdAt: string;
}

export interface SystemStatistics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalIssues: number;
  completedIssues: number;
  totalSprints: number;
  activeSprints: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

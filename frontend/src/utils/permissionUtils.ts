import { AuthUser, User } from '../types';

/**
 * Checks if a user is authorized (System Admin, Company Admin, Project Manager, Lead, Director, CEO/CTO, etc.)
 * Authorized users have permissions to create new departments and modify department assignments.
 */
export const isAuthorizedUser = (user: AuthUser | User | null | undefined): boolean => {
  if (!user) return false;

  // System Administrator
  if (user.isSystemAdmin) return true;

  // Role-based check
  if (
    user.roles?.some((r) =>
      ['Admin', 'CompanyAdmin', 'Manager', 'ProjectManager', 'Owner', 'Yönetici'].includes(r)
    )
  ) {
    return true;
  }

  // Job title & department keywords
  const title = (user.jobTitle || '').toLowerCase();
  const dept = (user.department || '').toLowerCase();

  return (
    title.includes('manager') ||
    title.includes('yönetici') ||
    title.includes('direktör') ||
    title.includes('director') ||
    title.includes('lead') ||
    title.includes('lider') ||
    title.includes('owner') ||
    title.includes('cto') ||
    title.includes('ceo') ||
    title.includes('kurucu') ||
    title.includes('pm') ||
    title.includes('admin') ||
    dept.includes('yönetim') ||
    dept.includes('management')
  );
};

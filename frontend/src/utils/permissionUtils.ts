import { AuthUser, User } from '../types';

const AUTHORIZED_MANAGER_EMAILS = [
  'admin@flowtask.com',
  'demo@flowtask.com',
  'manager@techflow.com',
  'admin@acmeglobal.com',
  'sinan.vural@nexusfin.com',
  'hakan.ozturk@pulsehealth.com',
  'erdem.soylu@vortexlog.com',
];

/**
 * Checks if a user is a Company Authorized Person / Manager / Admin (Şirket Yetkilisi).
 * Only authorized managers can manage departments, send company announcements, and create projects.
 * Regular employees (including designers, developers, QA, team leads) cannot change departments.
 */
export const isAuthorizedUser = (user: AuthUser | User | null | undefined): boolean => {
  if (!user) return false;

  // System Administrator
  if (user.isSystemAdmin) return true;

  const email = (user.email || '').toLowerCase().trim();
  if (AUTHORIZED_MANAGER_EMAILS.includes(email)) return true;

  // Role-based check (Only Admin, CompanyAdmin, Manager roles)
  if (
    user.roles?.some((r) =>
      ['Admin', 'CompanyAdmin', 'Manager', 'Owner', 'Yönetici'].includes(r)
    )
  ) {
    return true;
  }

  // Job title keywords (Strictly Company Executives & General Managers only)
  const title = (user.jobTitle || '').toLowerCase();

  return (
    title.includes('genel müdür') ||
    title.includes('operasyon müdürü') ||
    title.includes('general manager') ||
    title.includes('müdür') ||
    title.includes('direktör') ||
    title.includes('director') ||
    title.includes('ceo') ||
    title.includes('cto') ||
    title.includes('kurucu') ||
    title.includes('şirket yetkilisi') ||
    title.includes('company admin')
  );
};

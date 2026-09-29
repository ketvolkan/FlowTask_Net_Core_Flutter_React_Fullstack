import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IssuePriority, IssueStatus, IssueType, ProjectRole, SprintStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'sm',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))} {...props}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
  const { t } = useLanguage();
  switch (status) {
    case 'Todo':
      return <Badge variant="default">{t('status.todo', 'Yapılacak')}</Badge>;
    case 'InProgress':
      return <Badge variant="info">{t('status.inProgress', 'Devam Eden')}</Badge>;
    case 'InReview':
      return <Badge variant="warning">{t('status.inReview', 'İncelemede')}</Badge>;
    case 'Done':
      return <Badge variant="success">{t('status.done', 'Tamamlandı')}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: IssuePriority }> = ({ priority }) => {
  const { t } = useLanguage();
  switch (priority) {
    case 'Low':
      return <Badge variant="default">{t('priority.low', 'Düşük')}</Badge>;
    case 'Medium':
      return <Badge variant="info">{t('priority.medium', 'Orta')}</Badge>;
    case 'High':
      return <Badge variant="warning">{t('priority.high', 'Yüksek')}</Badge>;
    case 'Urgent':
      return <Badge variant="danger">{t('priority.urgent', 'Acil')}</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export const TypeBadge: React.FC<{ type: IssueType }> = ({ type }) => {
  const { t } = useLanguage();
  switch (type) {
    case 'Task':
      return <Badge variant="info">{t('type.task', 'Görev')}</Badge>;
    case 'Bug':
      return <Badge variant="danger">{t('type.bug', 'Hata')}</Badge>;
    case 'Story':
      return <Badge variant="success">{t('type.story', 'Hikaye')}</Badge>;
    case 'Epic':
      return <Badge variant="purple">{t('type.epic', 'Epik')}</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

export const SprintStatusBadge: React.FC<{ status: SprintStatus }> = ({ status }) => {
  const { t } = useLanguage();
  switch (status) {
    case 'Planned':
      return <Badge variant="default">{t('backlog.plannedSprint', 'Planlanan')}</Badge>;
    case 'Active':
      return <Badge variant="success">{t('backlog.activeSprint', 'Aktif')}</Badge>;
    case 'Completed':
      return <Badge variant="info">{t('status.done', 'Tamamlandı')}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const ProjectRoleBadge: React.FC<{ role: ProjectRole | number | string }> = ({ role }) => {
  const { t } = useLanguage();
  const normalizedRole = String(role).toLowerCase();

  if (role === 'Owner' || role === 1 || normalizedRole === 'owner') {
    return <Badge variant="purple">{t('role.owner', 'Proje Sahibi')}</Badge>;
  }
  if (role === 'Admin' || role === 2 || normalizedRole === 'admin') {
    return <Badge variant="info">{t('role.admin', 'Yönetici')}</Badge>;
  }
  if (role === 'Member' || role === 3 || normalizedRole === 'member') {
    return <Badge variant="default">{t('role.member', 'Üye')}</Badge>;
  }
  if (role === 'Viewer' || role === 4 || normalizedRole === 'viewer') {
    return <Badge variant="default">{t('role.viewer', 'Gözlemci')}</Badge>;
  }
  return <Badge>{role}</Badge>;
};

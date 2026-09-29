import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IssuePriority, IssueStatus, IssueType, ProjectRole, SprintStatus } from '../../types';

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
  switch (status) {
    case 'Todo':
      return <Badge variant="default">To Do</Badge>;
    case 'InProgress':
      return <Badge variant="info">In Progress</Badge>;
    case 'InReview':
      return <Badge variant="warning">In Review</Badge>;
    case 'Done':
      return <Badge variant="success">Done</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: IssuePriority }> = ({ priority }) => {
  switch (priority) {
    case 'Low':
      return <Badge variant="default">Low</Badge>;
    case 'Medium':
      return <Badge variant="info">Medium</Badge>;
    case 'High':
      return <Badge variant="warning">High</Badge>;
    case 'Urgent':
      return <Badge variant="danger">Urgent</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export const TypeBadge: React.FC<{ type: IssueType }> = ({ type }) => {
  switch (type) {
    case 'Task':
      return <Badge variant="info">Task</Badge>;
    case 'Bug':
      return <Badge variant="danger">Bug</Badge>;
    case 'Story':
      return <Badge variant="success">Story</Badge>;
    case 'Epic':
      return <Badge variant="purple">Epic</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

export const SprintStatusBadge: React.FC<{ status: SprintStatus }> = ({ status }) => {
  switch (status) {
    case 'Planned':
      return <Badge variant="default">Planned</Badge>;
    case 'Active':
      return <Badge variant="success">Active</Badge>;
    case 'Completed':
      return <Badge variant="info">Completed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const ProjectRoleBadge: React.FC<{ role: ProjectRole }> = ({ role }) => {
  switch (role) {
    case 'Owner':
      return <Badge variant="purple">Owner</Badge>;
    case 'Admin':
      return <Badge variant="info">Admin</Badge>;
    case 'Member':
      return <Badge variant="default">Member</Badge>;
    case 'Viewer':
      return <Badge variant="default">Viewer</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

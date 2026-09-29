import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { SystemStatistics } from '../../types';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  FolderKanban,
  Kanban,
  Layers,
  Activity,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await adminApi.getStatistics();
        setStats(data);
      } catch (e) {
        console.error('Failed to load admin stats', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('admin.dashboardTitle', 'System Administration')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('admin.dashboardSubtitle', 'Manage platform users, projects, statistics, and audit logs.')}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          {t('admin.loadingMetrics', 'Loading system metrics...')}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('admin.totalUsers', 'Total Users')}
              </span>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="mt-1 text-xs text-slate-400">
              {stats.activeUsers} {t('admin.activeAccounts', 'active accounts')}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('admin.totalProjects', 'Total Projects')}
              </span>
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                <FolderKanban className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.totalProjects}</p>
            <p className="mt-1 text-xs text-slate-400">{t('admin.createdAcross', 'Created across platform')}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('admin.totalIssues', 'Total Issues')}
              </span>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Kanban className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.totalIssues}</p>
            <p className="mt-1 text-xs text-slate-400">
              {stats.completedIssues} {t('admin.completedIssues', 'completed')}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('admin.totalSprints', 'Total Sprints')}
              </span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.totalSprints}</p>
            <p className="mt-1 text-xs text-slate-400">
              {stats.activeSprints} {t('admin.activeSprintsCount', 'currently active')}
            </p>
          </div>
        </div>
      ) : null}

      {/* Admin Modules Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/users"
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {t('admin.userManagement', 'User Management')}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {t('admin.userManagementDesc', 'Create users, assign system admin/member roles, activate or suspend accounts.')}
          </p>
        </Link>

        <Link
          to="/admin/projects"
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
              <FolderKanban className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {t('admin.projectGovernance', 'Project Governance')}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {t('admin.projectGovernanceDesc', 'View all organization workspaces, owners, issue counts, and manage workspaces.')}
          </p>
        </Link>

        <Link
          to="/admin/logs"
          className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {t('admin.auditLogs', 'Audit & Activity Logs')}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {t('admin.auditLogsDesc', 'Inspect all system operations, status changes, assignments, and timestamps.')}
          </p>
        </Link>
      </div>
    </div>
  );
};

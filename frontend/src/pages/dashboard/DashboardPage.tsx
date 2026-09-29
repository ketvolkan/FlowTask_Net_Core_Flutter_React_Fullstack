import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { projectsApi } from '../../api/projectsApi';
import { issuesApi } from '../../api/issuesApi';
import { adminApi } from '../../api/adminApi';
import { Project, Issue, ActivityLog } from '../../types';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { IssueDetailModal } from '../../components/issues/IssueDetailModal';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Layers,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [projData, issuesData] = await Promise.all([
        projectsApi.getProjects(1, 6),
        issuesApi.getIssues({ assigneeId: user?.id, pageSize: 8 }),
      ]);

      setProjects(projData?.items || []);
      setMyIssues(issuesData?.items || []);

      if (user?.isSystemAdmin) {
        const logsData = await adminApi.getActivityLogs(undefined, 1, 8);
        setRecentLogs(logsData?.items || []);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const issuesList = myIssues || [];
  const completedCount = issuesList.filter((i) => i.status === 'Done').length;
  const inProgressCount = issuesList.filter((i) => i.status === 'InProgress').length;
  const todoCount = issuesList.filter((i) => i.status === 'Todo').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              Overview Dashboard
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200/80">
              Here is what is happening across your projects and tasks today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/projects">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned to Me
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{myIssues.length}</p>
          <p className="mt-1 text-xs text-slate-400">Total active issues</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{inProgressCount}</p>
          <p className="mt-1 text-xs text-slate-400">Currently in motion</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="mt-1 text-xs text-slate-400">Done items</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Projects
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{projects.length}</p>
          <p className="mt-1 text-xs text-slate-400">Participating workspaces</p>
        </div>
      </div>

      {/* Main Grid: My Issues & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Issues */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Assigned Issues</h3>
              <p className="text-xs text-slate-400">Tasks and bugs waiting for your action</p>
            </div>
            <Link to="/board" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Open Board →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading issues...</div>
            ) : myIssues.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                You have no issues currently assigned.
              </div>
            ) : (
              myIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <TypeBadge type={issue.type} />
                    <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600">
                      {issue.key}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {issue.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Projects */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Projects</h3>
              <p className="text-xs text-slate-400">Quick access to workspaces</p>
            </div>
            <Link to="/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              All ({projects.length})
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No projects found.</div>
            ) : (
              projects.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shrink-0 shadow-xs">
                      {proj.key.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                        {proj.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {proj.memberCount} members • {proj.issueCount} issues
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed for Admins */}
      {user?.isSystemAdmin && recentLogs.length > 0 && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">System Activity Stream</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-800">{log.details || `${log.action} on ${log.entityType}`}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {selectedIssueId && (
        <IssueDetailModal
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          issueId={selectedIssueId}
          onIssueUpdated={fetchDashboardData}
          onIssueDeleted={fetchDashboardData}
        />
      )}
    </div>
  );
};

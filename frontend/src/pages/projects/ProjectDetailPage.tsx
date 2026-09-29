import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsApi } from '../../api/projectsApi';
import { ProjectDetail } from '../../types';
import { Button } from '../../components/common/Button';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ProjectMembersModal } from '../../components/projects/ProjectMembersModal';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Kanban,
  Layers,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const fetchProjectDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await projectsApi.getProjectById(id);
      setProject(data);
    } catch (e) {
      console.error('Failed to load project details', e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetail();
  }, [fetchProjectDetail]);

  const handleDeleteProject = async () => {
    if (!id || !project) return;
    if (!window.confirm(`Are you sure you want to delete project ${project.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await projectsApi.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      console.error('Delete project failed', err);
      alert('Failed to delete project');
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading project details...</div>;
  }

  if (!project) {
    return <div className="py-20 text-center text-xs text-rose-500">Project not found.</div>;
  }

  const isOwnerOrAdmin =
    project.ownerId === user?.id ||
    user?.isSystemAdmin ||
    project.members.some(
      (m) => m.userId === user?.id && (m.role === 'Owner' || m.role === 'Admin')
    );

  return (
    <div className="space-y-6">
      {/* Project Header Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
              {project.key.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
                <span className="rounded-lg bg-indigo-50 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-700">
                  {project.key}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl">
                {project.description || 'No description provided.'}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {format(new Date(project.createdAt), 'MMMM d, yyyy')}
                </span>
                <span>•</span>
                <span>Owner: <strong className="text-slate-700">{project.ownerName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/board?project=${project.id}`}>
              <Button size="sm" variant="outline" leftIcon={<Kanban className="h-4 w-4" />}>
                Kanban Board
              </Button>
            </Link>

            <Link to={`/backlog?project=${project.id}`}>
              <Button size="sm" variant="outline" leftIcon={<Layers className="h-4 w-4" />}>
                Sprints & Backlog
              </Button>
            </Link>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsMembersModalOpen(true)}
              leftIcon={<Users className="h-4 w-4" />}
            >
              Team ({project.members.length})
            </Button>

            {isOwnerOrAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:bg-rose-50"
                onClick={handleDeleteProject}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Issues
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Kanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{project.totalIssues}</p>
          <p className="mt-1 text-xs text-slate-400">Across all statuses</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Issues
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{project.openIssues}</p>
          <p className="mt-1 text-xs text-slate-400">Todo & In Progress</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Done Issues
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{project.doneIssues}</p>
          <p className="mt-1 text-xs text-slate-400">Completed items</p>
        </div>
      </div>

      {/* Members Section Preview */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Project Team Members</h3>
            <p className="text-xs text-slate-400">People with access to this workspace</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMembersModalOpen(true)}
            leftIcon={<Settings className="h-3.5 w-3.5" />}
          >
            Manage Team
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {project.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <UserAvatar name={m.userFullName} avatarUrl={m.userAvatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{m.userFullName}</p>
                <p className="text-[11px] text-slate-500 capitalize">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members Modal */}
      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          fetchProjectDetail();
        }}
        projectId={project.id}
      />
    </div>
  );
};

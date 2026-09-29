import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
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
import { tr as dateFnsTr, enUS as dateFnsEn } from 'date-fns/locale';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();
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
    if (!window.confirm(t('projectDetail.deleteConfirm', 'Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'))) {
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

  const dateLocale = language === 'tr' ? dateFnsTr : dateFnsEn;

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">{t('projectDetail.loading', 'Proje detayları yükleniyor...')}</div>;
  }

  if (!project) {
    return <div className="py-20 text-center text-xs text-rose-500">{t('projectDetail.notFound', 'Proje bulunamadı.')}</div>;
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
                {project.description || t('projects.noDescription', 'Açıklama belirtilmemiş.')}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t('projectDetail.created', 'Oluşturulma:')} {format(new Date(project.createdAt), 'MMMM d, yyyy', { locale: dateLocale })}
                </span>
                <span>•</span>
                <span>{t('projectDetail.owner', 'Sahibi:')} <strong className="text-slate-700">{project.ownerName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/board?project=${project.id}`}>
              <Button size="sm" variant="outline" leftIcon={<Kanban className="h-4 w-4" />}>
                {t('nav.board', 'Kanban Panosu')}
              </Button>
            </Link>

            <Link to={`/backlog?project=${project.id}`}>
              <Button size="sm" variant="outline" leftIcon={<Layers className="h-4 w-4" />}>
                {t('nav.backlog', 'Sprintler & Backlog')}
              </Button>
            </Link>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsMembersModalOpen(true)}
              leftIcon={<Users className="h-4 w-4" />}
            >
              {t('projectDetail.team', 'Ekip')} ({project.members.length})
            </Button>

            {isOwnerOrAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:bg-rose-50"
                onClick={handleDeleteProject}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                {t('common.delete', 'Sil')}
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
              {t('projectDetail.totalIssues', 'Toplam Görev')}
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Kanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{project.totalIssues}</p>
          <p className="mt-1 text-xs text-slate-400">{t('projectDetail.acrossStatuses', 'Tüm durumlar dahil')}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('projectDetail.openIssues', 'Açık Görevler')}
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{project.openIssues}</p>
          <p className="mt-1 text-xs text-slate-400">{t('projectDetail.openSubtitle', 'Yapılacak & Devam Eden')}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('projectDetail.doneIssues', 'Biten Görevler')}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{project.doneIssues}</p>
          <p className="mt-1 text-xs text-slate-400">{t('projectDetail.doneSubtitle', 'Tamamlanmış işler')}</p>
        </div>
      </div>

      {/* Members Section Preview */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('projectDetail.teamMembers', 'Proje Ekip Üyeleri')}</h3>
            <p className="text-xs text-slate-400">{t('projectDetail.teamSubtitle', 'Bu çalışma alanına erişimi olan kişiler')}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMembersModalOpen(true)}
            leftIcon={<Settings className="h-3.5 w-3.5" />}
          >
            {t('projectDetail.manageTeam', 'Ekibi Yönet')}
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { projectsApi } from '../../api/projectsApi';
import { issuesApi } from '../../api/issuesApi';
import { adminApi } from '../../api/adminApi';
import { Project, Issue, ActivityLog, ProjectMember } from '../../types';
import { StatusBadge, PriorityBadge, TypeBadge, ProjectRoleBadge } from '../../components/common/Badge';
import { UserAvatar } from '../../components/common/UserAvatar';
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
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr as dateFnsTr, enUS as dateFnsEn } from 'date-fns/locale';

interface MemberWorkloadSummary {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  role: string;
  projectName: string;
  totalIssues: number;
  doneIssues: number;
  inProgressIssues: number;
  todoIssues: number;
  completionRate: number;
  activeIssues: Issue[];
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [teamWorkloads, setTeamWorkloads] = useState<MemberWorkloadSummary[]>([]);
  const [totalTeamMembers, setTotalTeamMembers] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [projData, issuesData] = await Promise.all([
        projectsApi.getProjects(1, 10),
        issuesApi.getIssues({ assigneeId: user?.id, pageSize: 8 }),
      ]);

      const projectList = projData?.items || [];
      setProjects(projectList);
      setMyIssues(issuesData?.items || []);

      // If we have projects, load team members and project issues to compute team workload overview
      if (projectList.length > 0) {
        const primaryProject = projectList[0];
        try {
          const [membersData, allProjectIssues] = await Promise.all([
            projectsApi.getMembers(primaryProject.id),
            issuesApi.getIssues({ projectId: primaryProject.id, pageSize: 150 }),
          ]);

          const members: ProjectMember[] = Array.isArray(membersData) ? membersData : [];
          const projectIssues: Issue[] = allProjectIssues?.items || [];
          setTotalTeamMembers(members.length);

          const workloads: MemberWorkloadSummary[] = members.map((m) => {
            const userAssigned = projectIssues.filter((i) => i.assigneeId === m.userId);
            const done = userAssigned.filter((i) => i.status === 'Done').length;
            const inProgress = userAssigned.filter((i) => i.status === 'InProgress').length;
            const todo = userAssigned.filter((i) => i.status === 'Todo').length;
            const inReview = userAssigned.filter((i) => i.status === 'InReview').length;
            const total = userAssigned.length;
            const rate = total > 0 ? Math.round((done / total) * 100) : 0;

            const name = m.userFullName || m.fullName || m.userEmail || m.email || 'İsimsiz Üye';

            return {
              userId: m.userId,
              name,
              email: m.userEmail || m.email || '',
              avatarUrl: m.userAvatarUrl || m.avatarUrl,
              jobTitle: m.jobTitle,
              role: String(m.role),
              projectName: primaryProject.name,
              totalIssues: total,
              doneIssues: done,
              inProgressIssues: inProgress + inReview,
              todoIssues: todo,
              completionRate: rate,
              activeIssues: userAssigned.filter((i) => i.status !== 'Done').slice(0, 3),
            };
          });

          setTeamWorkloads(workloads);
        } catch (e) {
          console.error('Failed to load project team data', e);
        }
      }

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

  const dateLocale = language === 'tr' ? dateFnsTr : dateFnsEn;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              {t('dashboard.overview', 'Genel Bakış')}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashboard.welcome', 'Tekrar hoş geldin')}, {user?.fullName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200/80">
              {t('dashboard.subtitle', 'Bugün projeleriniz, ekip iş yükü ve görevlerinizdeki son durum burada.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/team">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20" leftIcon={<Users className="h-4 w-4" />}>
                {t('dashboard.teamBoard', 'Ekip Panosu')}
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                {t('dashboard.viewProjects', 'Projeleri Görüntüle')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.assignedToMe', 'Bana Atananlar')}
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{myIssues.length}</p>
          <p className="mt-1 text-xs text-slate-400">{t('dashboard.activeIssues', 'Toplam aktif görev')}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.inProgress', 'Devam Edenler')}
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{inProgressCount}</p>
          <p className="mt-1 text-xs text-slate-400">{t('dashboard.currentlyMoving', 'Şu anda işlemde olan')}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.completed', 'Tamamlananlar')}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="mt-1 text-xs text-slate-400">{t('dashboard.doneItems', 'Biten işler')}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.teamMembersCount', 'Ekip Üyeleri')}
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{totalTeamMembers || projects.reduce((acc, p) => acc + p.memberCount, 0)}</p>
          <p className="mt-1 text-xs text-slate-400">{t('dashboard.activeTeamUsers', 'Aktif ekip kullanıcısı')}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.myProjects', 'Projelerim')}
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{projects.length}</p>
          <p className="mt-1 text-xs text-slate-400">{t('dashboard.workspaces', 'Dahil olunan projeler')}</p>
        </div>
      </div>

      {/* Team Workload & Completion Overview Section */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {t('dashboard.teamWorkload', 'Ekip Performansı & Görev Durumu')}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.teamWorkloadSubtitle', 'Ekipteki kullanıcıların görev tamamlama oranları ve ellerindeki aktif işler')}
            </p>
          </div>
          <Link to="/team" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>{t('dashboard.viewFullTeamBoard', 'Detaylı Ekip Panosuna Git')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
        ) : teamWorkloads.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {t('dashboard.noTeamData', 'Henüz ekip üyesi veya görev verisi bulunmuyor.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamWorkloads.map((member) => (
              <div
                key={member.userId}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:border-indigo-200 hover:bg-slate-50 transition-all"
              >
                {/* User Info Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{member.jobTitle || member.email}</p>
                    </div>
                  </div>
                  <ProjectRoleBadge role={member.role} />
                </div>

                {/* Progress & Stat line */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[11px] font-semibold text-slate-600">
                      {member.doneIssues}/{member.totalIssues} {t('dashboard.completedTasks', 'tamamlandı')}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700">%{member.completionRate}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${member.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Active Tasks Held by User */}
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {t('dashboard.currentTasks', 'Ellerindeki Görevler')}:
                  </span>

                  {member.activeIssues.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">
                      {member.totalIssues === 0 ? t('dashboard.noTasksAssigned', 'Görev atanmamış') : t('dashboard.allTasksDone', 'Tüm görevleri tamamlandı ✓')}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {member.activeIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-300 transition-colors cursor-pointer group text-xs"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="font-mono text-[10px] font-bold text-indigo-600">
                              {issue.key}
                            </span>
                            <span className="truncate text-[11px] text-slate-800 font-medium group-hover:text-indigo-600">
                              {issue.title}
                            </span>
                          </div>
                          <StatusBadge status={issue.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: My Issues & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Issues */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.myAssignedIssues', 'Bana Atanan Görevler')}</h3>
              <p className="text-xs text-slate-400">{t('dashboard.issuesSubtitle', 'İşlem yapmanızı bekleyen görev ve hatalar')}</p>
            </div>
            <Link to="/board" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              {t('dashboard.openBoard', 'Panoyu Aç')} →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
            ) : myIssues.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('dashboard.noAssignedIssues', 'Şu anda size atanmış açık bir görev bulunmuyor.')}
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
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.recentProjects', 'Projelerim')}</h3>
              <p className="text-xs text-slate-400">{t('dashboard.recentProjectsSubtitle', 'Çalışma alanlarına hızlı erişim')}</p>
            </div>
            <Link to="/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              {t('common.all', 'Tümü')} ({projects.length})
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('dashboard.noProjects', 'Kayıtlı proje bulunamadı.')}</div>
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
                        {proj.memberCount} {t('dashboard.membersCount', 'üye')} • {proj.issueCount} {t('dashboard.issuesCount', 'görev')}
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
            <h3 className="text-sm font-bold text-slate-900">{t('dashboard.activityStream', 'Sistem Aktivite Akışı')}</h3>
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
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: dateLocale })}
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

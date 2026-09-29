import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
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
  Kanban,
  CheckCircle,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr as dateFnsTr, enUS as dateFnsEn } from 'date-fns/locale';

import { SystemAdminDashboardView } from '../../components/admin/SystemAdminDashboardView';

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

  // If the user is a system admin, render the dedicated System Admin Dashboard with registered users and companies
  if (user?.isSystemAdmin) {
    return <SystemAdminDashboardView />;
  }

  const { selectedCompany, filterProjectsByCompany } = useCompany();
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [teamWorkloads, setTeamWorkloads] = useState<MemberWorkloadSummary[]>([]);
  const [totalTeamMembers, setTotalTeamMembers] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Check if current user is PM, Manager, Admin, or Owner (excluding system admin)
  const isManagerOrPm = useMemo(() => {
    if (!user || user.isSystemAdmin) return false;
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
      dept.includes('yönetim') ||
      dept.includes('management')
    );
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [projData, issuesData] = await Promise.all([
        projectsApi.getProjects(1, 10),
        issuesApi.getIssues({ assigneeId: user?.id, pageSize: 20 }),
      ]);

      const projectList = projData?.items || [];
      setProjects(projectList);
      setMyIssues(issuesData?.items || []);

      // If manager/PM and we have projects, load team members and project issues to compute team workload
      if (isManagerOrPm && projectList.length > 0) {
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
  }, [user, isManagerOrPm]);

  const displayedProjects = filterProjectsByCompany(projects);
  const issuesList = myIssues || [];
  const completedCount = issuesList.filter((i) => i.status === 'Done').length;
  const inProgressCount = issuesList.filter((i) => i.status === 'InProgress').length;
  const todoCount = issuesList.filter((i) => i.status === 'Todo').length;
  const myTotalCount = issuesList.length;
  const myCompletionRate = myTotalCount > 0 ? Math.round((completedCount / myTotalCount) * 100) : 0;

  const dateLocale = language === 'tr' ? dateFnsTr : dateFnsEn;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              {isManagerOrPm ? 'Yönetici & Proje Özeti' : 'Kişisel Çalışma Alanı'}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashboard.welcome', 'Tekrar hoş geldin')}, {user?.fullName}!
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-indigo-200/80">
              {isManagerOrPm
                ? selectedCompany.id !== 'all'
                  ? `Aktif Çalışma Alanı: ${selectedCompany.name} • Şirket projeleri ve ekip durumu.`
                  : 'Tüm projeler, ekip iş yükü ve sprint performans takibi.'
                : 'Size atanan aktif görevler, tamamlanan işleriniz ve dahil olduğunuz projeleriniz.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/board"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow-md hover:bg-indigo-50 transition-colors"
            >
              <Kanban className="h-4 w-4 text-indigo-600" />
              <span>İş Akışına Git</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isManagerOrPm ? 'Devam Edenler' : 'İşlemde Olan Görevlerim'}
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{inProgressCount}</p>
          <p className="mt-1 text-xs text-slate-400">
            {isManagerOrPm ? 'Şu anda işlemde olan işler' : 'Üzerinizde devam eden aktif görevler'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isManagerOrPm ? 'Tamamlananlar' : 'Tamamladığım Görevler'}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="mt-1 text-xs text-slate-400">
            {isManagerOrPm ? 'Biten sprint ve işler' : 'Başarıyla teslim ettiğiniz işler'}
          </p>
        </div>

        {/* Metric 3: Conditional (Team Members for PM vs ToDo for Normal Member) */}
        {isManagerOrPm ? (
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('dashboard.teamMembersCount', 'Ekip Üyeleri')}
              </span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {totalTeamMembers || displayedProjects.reduce((acc, p) => acc + p.memberCount, 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{t('dashboard.activeTeamUsers', 'Aktif ekip kullanıcısı')}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bekleyen Görevlerim
              </span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <ListTodo className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{todoCount}</p>
            <p className="mt-1 text-xs text-slate-400">Yapılacaklar listesindeki işleriniz</p>
          </div>
        )}

        {/* Metric 4 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('dashboard.myProjects', 'Projelerim')}
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{displayedProjects.length}</p>
          <p className="mt-1 text-xs text-slate-400">Dahil olunan çalışma alanları</p>
        </div>
      </div>

      {/* Conditional Section: Team Workload (PM/Admin) OR Personal Progress (Normal Member) */}
      {isManagerOrPm ? (
        /* PM / Manager View: Team Performance & Workloads */
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
              <span>{t('dashboard.viewAllMembers', 'Tüm Ekip Panosunu Aç')}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
          ) : teamWorkloads.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t('dashboard.noTeamWorkloads', 'Henüz proje ekibi ve görev verisi yüklenmedi.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamWorkloads.slice(0, 6).map((member) => (
                <div
                  key={member.userId}
                  className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{member.jobTitle || member.email}</p>
                        </div>
                      </div>
                      <ProjectRoleBadge role={member.role} />
                    </div>

                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">{t('dashboard.taskProgress', 'Görev İlerlemesi')}</span>
                        <span className="font-bold text-indigo-600">{member.completionRate}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${member.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200/60 text-[10px] text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800">{member.totalIssues}</span> toplam
                      </div>
                      <div>
                        <span className="font-semibold text-amber-600">{member.inProgressIssues}</span> işlemde
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-600">{member.doneIssues}</span> bitti
                      </div>
                    </div>
                  </div>

                  {member.activeIssues.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('dashboard.activeTasks', 'Üzerindeki İşler:')}
                      </p>
                      {member.activeIssues.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedIssueId(task.id)}
                          className="flex items-center justify-between text-[11px] text-slate-700 hover:text-indigo-600 cursor-pointer truncate py-0.5"
                        >
                          <span className="truncate flex-1">• {task.title}</span>
                          <StatusBadge status={task.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Normal Member View: Personal Progress & Quick Board Access */
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kişisel Görev İlerlemeniz</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Size atanmış {myTotalCount} görevden {completedCount} tanesini tamamladınız (%{myCompletionRate}).
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Başarı Oranı</span>
              <span className="text-indigo-600 font-bold">{myCompletionRate}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${myCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: My Issues & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Issues */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.myAssignedIssues', 'Bana Atanan Görevler')}</h3>
              <p className="text-xs text-slate-400">{t('dashboard.myAssignedIssuesSubtitle', 'Üzerinizde bulunan aktif sprint ve iş listesi')}</p>
            </div>
            <Link to="/board" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              {t('common.viewAll', 'Tümünü Gör')} ({myIssues.length})
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
              {t('common.all', 'Tümü')} ({displayedProjects.length})
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
            ) : displayedProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('dashboard.noProjects', 'Kayıtlı proje bulunamadı.')}</div>
            ) : (
              displayedProjects.map((proj) => (
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Platform Denetim & Aktivite Günlüğü</h3>
            </div>
            <Link to="/admin/logs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Tüm Loglar →
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={log.userFullName || 'Sistem'} size="xs" />
                  <div>
                    <span className="font-semibold text-slate-800">{log.userFullName || 'Sistem'}</span>
                    <span className="text-slate-500 ml-1.5">{log.action}</span>
                    <span className="font-mono text-[10px] text-indigo-600 ml-1.5">{log.entityType}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
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

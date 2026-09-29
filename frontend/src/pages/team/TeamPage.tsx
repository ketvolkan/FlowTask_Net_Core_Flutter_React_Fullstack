import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCompany } from '../../context/CompanyContext';
import { isAuthorizedUser } from '../../utils/permissionUtils';
import { projectsApi } from '../../api/projectsApi';
import { issuesApi } from '../../api/issuesApi';
import { usersApi } from '../../api/usersApi';
import { Project, ProjectMember, ProjectRole, Issue, IssueStatus } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';
import { DepartmentSelect } from '../../components/common/DepartmentSelect';
import { ProjectRoleBadge, StatusBadge, PriorityBadge, TypeBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { IssueDetailModal } from '../../components/issues/IssueDetailModal';
import {
  Users,
  Kanban,
  LayoutGrid,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
  Check,
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
  Building2,
  Lock,
  Save,
  Plus,
  Trash2,
  FolderPlus,
  Folder,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

interface MemberWorkload {
  member: ProjectMember;
  issues: Issue[];
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
  totalCount: number;
  completionRate: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export const TeamPage: React.FC = () => {
  const { t, isTurkish } = useLanguage();
  const { filterProjectsByCompany } = useCompany();
  const dateLocale = isTurkish ? trLocale : enUS;

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayedProjects = useMemo(() => {
    return filterProjectsByCompany(projects);
  }, [filterProjectsByCompany, projects]);

  const displayedProjectsRef = useRef<Project[]>(displayedProjects);
  useEffect(() => {
    displayedProjectsRef.current = displayedProjects;
  }, [displayedProjects]);

  const { user } = useAuth();
  const canManageDept = isAuthorizedUser(user);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
  const [search, setSearch] = useState('');
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<MemberWorkload | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const activeDetailUserId = selectedMemberForDetail?.member.userId;

  // Member department state inside detail modal
  const [memberDept, setMemberDept] = useState('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [deptSaveSuccess, setDeptSaveSuccess] = useState<string | null>(null);
  const [deptSaveError, setDeptSaveError] = useState<string | null>(null);

  // Member projects assignment state inside detail modal
  const [userAssignedProjects, setUserAssignedProjects] = useState<{ project: Project; role: ProjectRole }[]>([]);
  const [isLoadingUserProjects, setIsLoadingUserProjects] = useState(false);
  const [selectedProjectToAdd, setSelectedProjectToAdd] = useState('');
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<ProjectRole>('Member');
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  const [projectActionSuccess, setProjectActionSuccess] = useState<string | null>(null);
  const [projectActionError, setProjectActionError] = useState<string | null>(null);

  const fetchUserProjects = useCallback(async (userId: string, targetProjects?: Project[]) => {
    const list = targetProjects || displayedProjectsRef.current;
    if (!userId || list.length === 0) {
      setUserAssignedProjects([]);
      setIsLoadingUserProjects(false);
      return;
    }
    setIsLoadingUserProjects(true);
    try {
      const results = await Promise.all(
        list.map(async (p) => {
          try {
            const pMembers = await projectsApi.getMembers(p.id);
            const m = pMembers.find((x) => x.userId === userId);
            if (m) {
              return { project: p, role: m.role };
            }
            return null;
          } catch {
            return null;
          }
        })
      );
      setUserAssignedProjects(results.filter(Boolean) as { project: Project; role: ProjectRole }[]);
    } catch (err) {
      console.error('Failed to load user projects', err);
    } finally {
      setIsLoadingUserProjects(false);
    }
  }, []);

  useEffect(() => {
    if (!activeDetailUserId) {
      setUserAssignedProjects([]);
      setIsLoadingUserProjects(false);
      return;
    }

    setDeptSaveSuccess(null);
    setDeptSaveError(null);
    setProjectActionSuccess(null);
    setProjectActionError(null);
    setSelectedProjectToAdd('');
    setSelectedRoleToAdd('Member');

    usersApi
      .getUserById(activeDetailUserId)
      .then((u) => {
        setMemberDept(u?.department || '');
      })
      .catch(() => {
        setMemberDept('');
      });

    fetchUserProjects(activeDetailUserId, displayedProjectsRef.current);
  }, [activeDetailUserId, fetchUserProjects]);

  const handleSaveMemberDepartment = async () => {
    if (!canManageDept) {
      setDeptSaveError(t('common.unauthorized', 'Bu işlemi yapmaya yetkiniz bulunmamaktadır.'));
      return;
    }
    if (!selectedMemberForDetail?.member.userId) return;
    setIsSavingDept(true);
    setDeptSaveSuccess(null);
    setDeptSaveError(null);
    try {
      const updated = await usersApi.updateDepartment(
        selectedMemberForDetail.member.userId,
        memberDept
      );
      setDeptSaveSuccess(t('team.deptUpdated', 'Departman başarıyla güncellendi.'));
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === selectedMemberForDetail.member.userId
            ? { ...m, department: updated.department }
            : m
        )
      );
      setTimeout(() => setDeptSaveSuccess(null), 3500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setDeptSaveError(e.response?.data?.message || 'Departman güncellenemedi.');
    } finally {
      setIsSavingDept(false);
    }
  };

  const handleAddUserToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageDept) {
      setProjectActionError(t('common.unauthorized', 'Bu işlemi yapmaya yetkiniz bulunmamaktadır.'));
      return;
    }
    if (!selectedProjectToAdd || !selectedMemberForDetail?.member.userId) return;

    setIsAddingToProject(true);
    setProjectActionSuccess(null);
    setProjectActionError(null);

    try {
      await projectsApi.addMember(selectedProjectToAdd, {
        userId: selectedMemberForDetail.member.userId,
        email: selectedMemberForDetail.member.userEmail || selectedMemberForDetail.member.email,
        role: selectedRoleToAdd,
      });

      setProjectActionSuccess(t('team.addedToProjectSuccess', 'Kullanıcı başarıyla projeye dahil edildi!'));
      setSelectedProjectToAdd('');
      fetchUserProjects(selectedMemberForDetail.member.userId);
      fetchTeamData();
      setTimeout(() => setProjectActionSuccess(null), 3500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setProjectActionError(e.response?.data?.message || 'Kullanıcı projeye eklenemedi.');
    } finally {
      setIsAddingToProject(false);
    }
  };

  const handleRemoveUserFromProject = async (projectId: string, projectName: string) => {
    if (!canManageDept) {
      setProjectActionError(t('common.unauthorized', 'Bu işlemi yapmaya yetkiniz bulunmamaktadır.'));
      return;
    }
    if (!selectedMemberForDetail?.member.userId) return;
    const userName = selectedMemberForDetail.member.userFullName || 'Kullanıcıyı';
    if (!window.confirm(`${userName} adlı kullanıcıyı "${projectName}" projesinden çıkarmak istediğinize emin misiniz?`)) {
      return;
    }

    setProjectActionSuccess(null);
    setProjectActionError(null);

    try {
      await projectsApi.removeMember(projectId, selectedMemberForDetail.member.userId);
      setProjectActionSuccess(t('team.removedFromProjectSuccess', 'Kullanıcı projeden başarıyla çıkarıldı.'));
      fetchUserProjects(selectedMemberForDetail.member.userId);
      fetchTeamData();
      setTimeout(() => setProjectActionSuccess(null), 3500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setProjectActionError(e.response?.data?.message || 'Kullanıcı projeden çıkarılamadı.');
    }
  };

  const availableProjectsToAdd = useMemo(() => {
    const assignedIds = new Set(userAssignedProjects.map((up) => up.project.id));
    return displayedProjects.filter((p) => !assignedIds.has(p.id));
  }, [displayedProjects, userAssignedProjects]);

  // Load Projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.getProjects(1, 100);
        const list = data?.items || [];
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };
    loadProjects();
  }, [selectedProjectId]);

  // Adjust selectedProjectId if it doesn't belong to current company filter
  useEffect(() => {
    if (displayedProjects.length > 0) {
      const exists = displayedProjects.some((p) => p.id === selectedProjectId);
      if (!exists) {
        setSelectedProjectId(displayedProjects[0].id);
      }
    }
  }, [displayedProjects, selectedProjectId]);

  // Load Members & Issues for selected project
  const fetchTeamData = useCallback(async () => {
    if (!selectedProjectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [membersData, issuesData] = await Promise.all([
        projectsApi.getMembers(selectedProjectId),
        issuesApi.getIssues({
          projectId: selectedProjectId,
          pageSize: 200,
        }),
      ]);

      setMembers(Array.isArray(membersData) ? membersData : []);
      setIssues(issuesData?.items || []);
    } catch (err) {
      console.error('Failed to load team data', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Calculate workload per member
  const memberWorkloads: MemberWorkload[] = useMemo(() => {
    return members.map((m) => {
      const userIssues = issues.filter((i) => i.assigneeId === m.userId);
      const todo = userIssues.filter((i) => i.status === 'Todo').length;
      const inProgress = userIssues.filter((i) => i.status === 'InProgress').length;
      const inReview = userIssues.filter((i) => i.status === 'InReview').length;
      const done = userIssues.filter((i) => i.status === 'Done').length;
      const total = userIssues.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;

      const totalSp = userIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
      const doneSp = userIssues
        .filter((i) => i.status === 'Done')
        .reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);

      return {
        member: m,
        issues: userIssues,
        todoCount: todo,
        inProgressCount: inProgress,
        inReviewCount: inReview,
        doneCount: done,
        totalCount: total,
        completionRate: rate,
        totalStoryPoints: totalSp,
        completedStoryPoints: doneSp,
      };
    });
  }, [members, issues]);

  // Filtered members based on search
  const filteredWorkloads = useMemo(() => {
    if (!search.trim()) return memberWorkloads;
    const q = search.toLowerCase().trim();
    return memberWorkloads.filter((mw) => {
      const name = (mw.member.userFullName || mw.member.fullName || '').toLowerCase();
      const email = (mw.member.userEmail || mw.member.email || '').toLowerCase();
      const title = (mw.member.jobTitle || '').toLowerCase();
      return name.includes(q) || email.includes(q) || title.includes(q);
    });
  }, [memberWorkloads, search]);

  // Top summary stats
  const totalMembersCount = members.length;
  const activeAssigneesCount = memberWorkloads.filter((mw) => mw.totalCount > 0).length;
  const totalAssignedTasks = issues.filter((i) => !!i.assigneeId).length;
  const totalCompletedTasks = issues.filter((i) => !!i.assigneeId && i.status === 'Done').length;
  const overallRate = totalAssignedTasks > 0 ? Math.round((totalCompletedTasks / totalAssignedTasks) * 100) : 0;

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const getWorkloadBadge = (activeCount: number) => {
    if (activeCount === 0) {
      return (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {t('team.statusAvailable', 'Müsait')}
        </span>
      );
    }
    if (activeCount > 5) {
      return (
        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
          {t('team.statusBusy', 'Yoğun İş Yükü')}
        </span>
      );
    }
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
        {t('team.statusOptimal', 'Dengeli')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Project Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('team.title', 'Ekip & Aktif Kullanıcılar')}
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {t('team.subtitle', 'Projedeki kullanıcıların görev dağılımı, performans durumları ve iş yükü takibi')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Picker */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {displayedProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>

          {/* View Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>{t('team.boardView', 'Kullanıcı Panosu')}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{t('team.gridView', 'Kart Görünümü')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('team.totalMembers', 'Ekip Üyeleri')}
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{totalMembersCount}</p>
          <p className="mt-1 text-xs text-slate-400">
            {currentProject ? `${currentProject.name} projesinde` : 'Kayıtlı kullanıcı'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('team.activeAssignees', 'Aktif Görev Alanlar')}
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeAssigneesCount}</p>
          <p className="mt-1 text-xs text-slate-400">
            {t('team.holdingTasks', 'Üzerinde en az 1 görev olan')}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('team.assignedTasks', 'Atanan Görevler')}
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{totalAssignedTasks}</p>
          <p className="mt-1 text-xs text-slate-400">
            {totalCompletedTasks} {t('team.completedCount', 'tamamlandı')}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('team.completionRate', 'Genel Başarı')}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-2xl font-bold text-slate-900">%{overallRate}</p>
            <span className="text-xs text-emerald-600 font-medium">{totalCompletedTasks}/{totalAssignedTasks} iş</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('team.searchMembers', 'Ekip üyesi veya unvan ara...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Content: Loading / Empty / Views */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
      ) : filteredWorkloads.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
          <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">{t('team.noMembersFound', 'Kullanıcı bulunamadı')}</p>
          <p className="text-xs text-slate-400 mt-1">{t('team.noMembersDesc', 'Seçilen projede aramanıza uygun üye yer almıyor.')}</p>
        </div>
      ) : viewMode === 'board' ? (
        /* View A: User-Based Kanban Swimlanes */
        <div className="space-y-4">
          {filteredWorkloads.map((mw) => {
            const name = mw.member.userFullName || mw.member.fullName || mw.member.userEmail || mw.member.email || 'İsimsiz Üye';
            const activeCount = mw.todoCount + mw.inProgressCount + mw.inReviewCount;

            const todoIssues = mw.issues.filter((i) => i.status === 'Todo');
            const inProgressIssues = mw.issues.filter((i) => i.status === 'InProgress');
            const inReviewIssues = mw.issues.filter((i) => i.status === 'InReview');
            const doneIssues = mw.issues.filter((i) => i.status === 'Done');

            return (
              <div
                key={mw.member.id}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* User Swimlane Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={name}
                      avatarUrl={mw.member.userAvatarUrl || mw.member.avatarUrl}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{name}</h3>
                        <ProjectRoleBadge role={mw.member.role} />
                        {getWorkloadBadge(activeCount)}
                      </div>
                      <p className="text-xs text-slate-400">
                        {mw.member.jobTitle || mw.member.userEmail || mw.member.email || ''}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">%{mw.completionRate}</span>
                        <span className="text-[11px] text-slate-400">
                          ({mw.doneCount}/{mw.totalCount} {t('team.tasks', 'görev')})
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${mw.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMemberForDetail(mw)}
                    >
                      {t('team.viewDetails', 'Detaylar')}
                    </Button>
                  </div>
                </div>

                {/* 4 Mini Kanban Columns for This User */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50/30">
                  {/* Column 1: Todo */}
                  <div className="rounded-xl bg-slate-100/60 p-3 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">{t('status.todo', 'Yapılacak')}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-bold text-slate-600">
                        {todoIssues.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {todoIssues.length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-slate-400">{t('team.emptyColumn', 'Görev yok')}</p>
                      ) : (
                        todoIssues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">
                                {issue.key}
                              </span>
                              <PriorityBadge priority={issue.priority} />
                            </div>
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2">{issue.title}</p>
                            {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                              <span className="mt-1.5 inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {issue.storyPoints} pt
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-100">
                      <span className="text-xs font-bold text-blue-900">{t('status.inProgress', 'Devam Eden')}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-700">
                        {inProgressIssues.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {inProgressIssues.length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-slate-400">{t('team.emptyColumn', 'Görev yok')}</p>
                      ) : (
                        inProgressIssues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-[10px] font-bold text-blue-700 group-hover:text-indigo-600">
                                {issue.key}
                              </span>
                              <PriorityBadge priority={issue.priority} />
                            </div>
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2">{issue.title}</p>
                            {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                              <span className="mt-1.5 inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {issue.storyPoints} pt
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 3: In Review */}
                  <div className="rounded-xl bg-amber-50/50 p-3 border border-amber-100">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-amber-100">
                      <span className="text-xs font-bold text-amber-900">{t('status.inReview', 'İncelemede')}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-700">
                        {inReviewIssues.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {inReviewIssues.length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-slate-400">{t('team.emptyColumn', 'Görev yok')}</p>
                      ) : (
                        inReviewIssues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className="p-2.5 rounded-lg bg-white border border-amber-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-[10px] font-bold text-amber-700 group-hover:text-indigo-600">
                                {issue.key}
                              </span>
                              <PriorityBadge priority={issue.priority} />
                            </div>
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2">{issue.title}</p>
                            {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                              <span className="mt-1.5 inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {issue.storyPoints} pt
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 4: Done */}
                  <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-emerald-100">
                      <span className="text-xs font-bold text-emerald-900">{t('status.done', 'Tamamlandı')}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                        {doneIssues.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {doneIssues.length === 0 ? (
                        <p className="py-4 text-center text-[11px] text-slate-400">{t('team.emptyColumn', 'Görev yok')}</p>
                      ) : (
                        doneIssues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            className="p-2.5 rounded-lg bg-white border border-emerald-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group opacity-90"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-[10px] font-bold text-emerald-700 group-hover:text-indigo-600">
                                {issue.key}
                              </span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2 line-through text-slate-500">{issue.title}</p>
                            {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                              <span className="mt-1.5 inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {issue.storyPoints} pt
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View B: Member Grid Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkloads.map((mw) => {
            const name = mw.member.userFullName || mw.member.fullName || mw.member.userEmail || mw.member.email || 'İsimsiz Üye';
            const activeCount = mw.todoCount + mw.inProgressCount + mw.inReviewCount;

            return (
              <div
                key={mw.member.id}
                className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={name}
                        avatarUrl={mw.member.userAvatarUrl || mw.member.avatarUrl}
                        size="md"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{name}</h3>
                        <p className="text-xs text-slate-400 truncate">
                          {mw.member.jobTitle || mw.member.userEmail || mw.member.email}
                        </p>
                      </div>
                    </div>
                    {getWorkloadBadge(activeCount)}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <ProjectRoleBadge role={mw.member.role} />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {mw.totalStoryPoints} {t('team.totalPoints', 'Toplam Puan')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{t('team.progress', 'Tamamlama')}</span>
                      <span className="font-bold text-indigo-700">%{mw.completionRate}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${mw.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Task Counts Summary */}
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                      <span className="block font-bold text-slate-800">{mw.todoCount}</span>
                      <span className="text-[10px] text-slate-400">{t('status.todo', 'Yapılacak')}</span>
                    </div>
                    <div className="rounded-xl bg-blue-50/60 p-2 border border-blue-100">
                      <span className="block font-bold text-blue-800">{mw.inProgressCount}</span>
                      <span className="text-[10px] text-blue-500">{t('status.inProgress', 'Devam')}</span>
                    </div>
                    <div className="rounded-xl bg-amber-50/60 p-2 border border-amber-100">
                      <span className="block font-bold text-amber-800">{mw.inReviewCount}</span>
                      <span className="text-[10px] text-amber-600">{t('status.inReview', 'İnceleme')}</span>
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 p-2 border border-emerald-100">
                      <span className="block font-bold text-emerald-800">{mw.doneCount}</span>
                      <span className="text-[10px] text-emerald-600">{t('status.done', 'Bitti')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedMemberForDetail(mw)}
                  >
                    {t('team.viewMemberDetail', 'Detaylı İncele')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedMemberForDetail && (
        <Modal
          isOpen={!!selectedMemberForDetail}
          onClose={() => setSelectedMemberForDetail(null)}
          size="2xl"
          title={t('team.memberDetailTitle', 'Kullanıcı Görev & İş Yükü Detayı')}
        >
          {(() => {
            const mw = selectedMemberForDetail;
            const name = mw.member.userFullName || mw.member.fullName || mw.member.userEmail || mw.member.email || 'İsimsiz Üye';
            return (
              <div className="space-y-6">
                {/* User Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={name}
                      avatarUrl={mw.member.userAvatarUrl || mw.member.avatarUrl}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-base font-bold">{name}</h3>
                      <p className="text-xs text-slate-300">
                        {mw.member.jobTitle || mw.member.userEmail || mw.member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProjectRoleBadge role={mw.member.role} />
                  </div>
                </div>

                {/* Department & Organization Management */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {t('department.title', 'Departman & Organizasyon')}
                      </h4>
                    </div>
                    {!canManageDept && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <Lock className="h-2.5 w-2.5" /> {t('department.locked', 'Salt Okunur')}
                      </span>
                    )}
                  </div>

                  {deptSaveSuccess && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{deptSaveSuccess}</span>
                    </div>
                  )}

                  {deptSaveError && (
                    <div className="rounded-xl bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
                      {deptSaveError}
                    </div>
                  )}

                  {canManageDept ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
                      <div className="flex-1">
                        <DepartmentSelect
                          label={t('department.userDept', 'Kullanıcı Departmanı')}
                          value={memberDept}
                          onChange={setMemberDept}
                          allowCreate={true}
                          placeholder={t('department.selectOrNew', 'Departman seçin veya yeni oluşturun...')}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSaveMemberDepartment}
                        isLoading={isSavingDept}
                        leftIcon={<Save className="h-3.5 w-3.5" />}
                      >
                        {t('department.updateDept', 'Departmanı Güncelle')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{memberDept || t('department.notSpecified', 'Departman belirtilmemiş')}</span>
                    </div>
                  )}
                </div>

                {/* User Projects & Project Assignment Management */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {t('team.userProjectsTitle', 'Dahil Olduğu Projeler & Atamalar')}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {userAssignedProjects.length} Proje
                    </span>
                  </div>

                  {projectActionSuccess && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{projectActionSuccess}</span>
                    </div>
                  )}

                  {projectActionError && (
                    <div className="rounded-xl bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
                      {projectActionError}
                    </div>
                  )}

                  {/* List of current projects */}
                  <div className="space-y-1.5">
                    {isLoadingUserProjects ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        Projeler yükleniyor...
                      </div>
                    ) : userAssignedProjects.length === 0 ? (
                      <div className="py-3 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                        Kullanıcı henüz hiçbir şirkete ait projeye atanmamış.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {userAssignedProjects.map(({ project: p, role }) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs shrink-0 border border-indigo-100">
                                {p.key}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <ProjectRoleBadge role={role} />
                                </div>
                              </div>
                            </div>

                            {canManageDept && (
                              <button
                                type="button"
                                title="Projeden Çıkar"
                                onClick={() => handleRemoveUserFromProject(p.id, p.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add User to Project Form (Authorized Manager Only) */}
                  {canManageDept && (
                    <div className="pt-2 border-t border-slate-200">
                      <form onSubmit={handleAddUserToProject} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Şirket Projesine Dahil Et
                          </label>
                          <select
                            value={selectedProjectToAdd}
                            onChange={(e) => setSelectedProjectToAdd(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">Proje seçiniz...</option>
                            {availableProjectsToAdd.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.key}] {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-32">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Rol
                          </label>
                          <select
                            value={selectedRoleToAdd}
                            onChange={(e) => setSelectedRoleToAdd(e.target.value as ProjectRole)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="Member">Member (Üye)</option>
                            <option value="Admin">Admin (Yönetici)</option>
                            <option value="Viewer">Viewer (İzleyici)</option>
                          </select>
                        </div>

                        <Button
                          type="submit"
                          size="sm"
                          disabled={!selectedProjectToAdd}
                          isLoading={isAddingToProject}
                          leftIcon={<Plus className="h-3.5 w-3.5" />}
                        >
                          Projeye Ekle
                        </Button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400">{t('team.totalAssigned', 'Toplam Görev')}</span>
                    <p className="text-xl font-bold text-slate-900">{mw.totalCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-xs text-emerald-600">{t('status.done', 'Tamamlanan')}</span>
                    <p className="text-xl font-bold text-emerald-700">{mw.doneCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-xs text-blue-600">{t('status.inProgress', 'Devam Eden')}</span>
                    <p className="text-xl font-bold text-blue-700">{mw.inProgressCount + mw.inReviewCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-xs text-purple-600">{t('team.storyPoints', 'Hikaye Puanı')}</span>
                    <p className="text-xl font-bold text-purple-700">{mw.completedStoryPoints}/{mw.totalStoryPoints} pt</p>
                  </div>
                </div>

                {/* Task Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    {t('team.assignedIssuesList', 'Kullanıcıya Atanmış Görevler')} ({mw.issues.length})
                  </h4>

                  {mw.issues.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      {t('team.noIssuesAssigned', 'Bu kullanıcıya atanmış herhangi bir görev bulunmuyor.')}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1 border border-slate-100 rounded-xl">
                      {mw.issues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setSelectedIssueId(issue.id);
                          }}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <TypeBadge type={issue.type} />
                            <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600">
                              {issue.key}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {issue.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {issue.storyPoints} pt
                              </span>
                            )}
                            <PriorityBadge priority={issue.priority} />
                            <StatusBadge status={issue.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          issueId={selectedIssueId}
          members={members}
          onIssueUpdated={fetchTeamData}
          onIssueDeleted={fetchTeamData}
        />
      )}
    </div>
  );
};

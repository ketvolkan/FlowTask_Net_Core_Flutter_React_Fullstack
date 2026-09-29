import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCompany } from '../../context/CompanyContext';
import { projectsApi } from '../../api/projectsApi';
import { issuesApi } from '../../api/issuesApi';
import { sprintsApi } from '../../api/sprintsApi';
import { Issue, IssuePriority, IssueStatus, IssueType, Project, ProjectMember, Sprint } from '../../types';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { CreateIssueModal } from '../../components/issues/CreateIssueModal';
import { IssueDetailModal } from '../../components/issues/IssueDetailModal';
import { MultiSelectDropdown, MultiSelectOption } from '../../components/common/MultiSelectDropdown';
import { Button } from '../../components/common/Button';
import {
  Plus,
  Search,
  RotateCcw,
  Kanban,
  Layers,
  Users,
  Tag,
  AlertTriangle,
  FolderKanban,
} from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { t } = useLanguage();
  const { filterProjectsByCompany } = useCompany();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(selectedProjectIdParam || '');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayedProjects = filterProjectsByCompany(projects);

  // Multi-select Filters
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<IssueStatus>('Todo');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Load Projects initially
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.getProjects(1, 100);
        const projectList = data?.items || [];
        setProjects(projectList);
        if (projectList.length > 0 && !selectedProjectId) {
          const initialId = selectedProjectIdParam || projectList[0].id;
          setSelectedProjectId(initialId);
        }
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    };
    loadProjects();
  }, [selectedProjectId, selectedProjectIdParam]);

  // Adjust selectedProjectId if it doesn't belong to current company filter
  useEffect(() => {
    if (displayedProjects.length > 0) {
      const exists = displayedProjects.some((p) => p.id === selectedProjectId);
      if (!exists) {
        setSelectedProjectId(displayedProjects[0].id);
      }
    }
  }, [displayedProjects, selectedProjectId]);

  // When selectedProjectId changes, load Sprints, Members, and All Issues for this project
  const fetchBoardData = useCallback(async () => {
    if (!selectedProjectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [sprintsData, membersData, issuesData] = await Promise.all([
        sprintsApi.getProjectSprints(selectedProjectId),
        projectsApi.getMembers(selectedProjectId),
        issuesApi.getIssues({
          projectId: selectedProjectId,
          pageSize: 200,
        }),
      ]);

      setSprints(Array.isArray(sprintsData) ? sprintsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setIssues(issuesData?.items || []);
    } catch (e) {
      console.error('Failed to load board data', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleProjectChange = (newProjectId: string) => {
    setSelectedProjectId(newProjectId);
    setSearchParams({ project: newProjectId });
    setSelectedSprintIds([]);
    setSelectedAssigneeIds([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
  };

  const handleResetFilters = () => {
    setSelectedSprintIds([]);
    setSelectedAssigneeIds([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
    setSearch('');
  };

  const isAnyFilterActive =
    selectedSprintIds.length > 0 ||
    selectedAssigneeIds.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedTypes.length > 0 ||
    search.trim().length > 0;

  // Filter issues in memory with multi-select checkboxes
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Sprint filter
      if (selectedSprintIds.length > 0) {
        const matchesSprint = selectedSprintIds.some((sId) => {
          if (sId === 'backlog') return !issue.sprintId;
          return issue.sprintId === sId;
        });
        if (!matchesSprint) return false;
      }

      // Assignee filter
      if (selectedAssigneeIds.length > 0) {
        const matchesAssignee = selectedAssigneeIds.some((aId) => {
          if (aId === 'unassigned') return !issue.assigneeId;
          return issue.assigneeId === aId;
        });
        if (!matchesAssignee) return false;
      }

      // Priority filter
      if (selectedPriorities.length > 0) {
        if (!selectedPriorities.includes(issue.priority)) return false;
      }

      // Type filter
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(issue.type)) return false;
      }

      // Search text
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const inTitle = issue.title.toLowerCase().includes(q);
        const inKey = issue.key.toLowerCase().includes(q);
        const inDesc = issue.description?.toLowerCase().includes(q);
        if (!inTitle && !inKey && !inDesc) return false;
      }

      return true;
    });
  }, [issues, selectedSprintIds, selectedAssigneeIds, selectedPriorities, selectedTypes, search]);

  const handleQuickCreate = (status: IssueStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  // Build Options for MultiSelectDropdowns
  const sprintOptions: MultiSelectOption[] = useMemo(() => {
    const list: MultiSelectOption[] = sprints.map((s) => ({
      value: s.id,
      label: s.name,
      badge: s.status === 'Active' ? 'Aktif' : s.status === 'Completed' ? 'Tamamlandı' : 'Planlandı',
      badgeColor:
        s.status === 'Active'
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          : s.status === 'Completed'
          ? 'bg-slate-100 text-slate-600'
          : 'bg-amber-100 text-amber-700',
    }));
    list.push({
      value: 'backlog',
      label: 'Proje Backlog (Sprintsiz)',
      badge: 'Backlog',
      badgeColor: 'bg-indigo-50 text-indigo-700',
    });
    return list;
  }, [sprints]);

  const assigneeOptions: MultiSelectOption[] = useMemo(() => {
    const list: MultiSelectOption[] = members.map((m) => ({
      value: m.userId,
      label: m.userFullName || m.fullName || m.userEmail || m.email || 'İsimsiz Üye',
      badge: String(m.role),
      badgeColor: 'bg-slate-100 text-slate-700',
    }));
    list.push({
      value: 'unassigned',
      label: 'Atanmamış Görevler',
      badge: 'Boşta',
      badgeColor: 'bg-rose-50 text-rose-600',
    });
    return list;
  }, [members]);

  const priorityOptions: MultiSelectOption[] = [
    { value: 'Urgent', label: 'Acil', badge: 'P1', badgeColor: 'bg-rose-100 text-rose-700' },
    { value: 'High', label: 'Yüksek', badge: 'P2', badgeColor: 'bg-amber-100 text-amber-700' },
    { value: 'Medium', label: 'Orta', badge: 'P3', badgeColor: 'bg-blue-100 text-blue-700' },
    { value: 'Low', label: 'Düşük', badge: 'P4', badgeColor: 'bg-slate-100 text-slate-700' },
  ];

  const typeOptions: MultiSelectOption[] = [
    { value: 'Task', label: 'Görev (Task)', badge: 'Task', badgeColor: 'bg-blue-100 text-blue-700' },
    { value: 'Bug', label: 'Hata (Bug)', badge: 'Bug', badgeColor: 'bg-rose-100 text-rose-700' },
    { value: 'Story', label: 'Hikaye (Story)', badge: 'Story', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { value: 'Epic', label: 'Büyük Özellik (Epic)', badge: 'Epic', badgeColor: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Kanban className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">İş Akışı</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Proje görevlerini sütunlar arasında sürükleyip bırakarak durumlarını güncelleyin ve filtreleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Görevlerde ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <Button
            size="sm"
            onClick={() => {
              setCreateDefaultStatus('Todo');
              setIsCreateModalOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Görev Oluştur
          </Button>
        </div>
      </div>

      {/* Filter Toolbar with Multi-Select Checkbox Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Picker */}
          <div className="flex items-center gap-1.5 shrink-0">
            <FolderKanban className="h-4 w-4 text-slate-400 ml-1" />
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {displayedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Multi-Select Sprint Filter */}
          <MultiSelectDropdown
            label="Sprint & Backlog"
            options={sprintOptions}
            selectedValues={selectedSprintIds}
            onChange={setSelectedSprintIds}
            icon={<Layers className="h-3.5 w-3.5" />}
          />

          {/* Multi-Select Assignee Filter */}
          <MultiSelectDropdown
            label="Sorumlu Kişi"
            options={assigneeOptions}
            selectedValues={selectedAssigneeIds}
            onChange={setSelectedAssigneeIds}
            icon={<Users className="h-3.5 w-3.5" />}
          />

          {/* Multi-Select Priority Filter */}
          <MultiSelectDropdown
            label="Öncelik"
            options={priorityOptions}
            selectedValues={selectedPriorities}
            onChange={setSelectedPriorities}
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
          />

          {/* Multi-Select Type Filter */}
          <MultiSelectDropdown
            label="Görev Tipi"
            options={typeOptions}
            selectedValues={selectedTypes}
            onChange={setSelectedTypes}
            icon={<Tag className="h-3.5 w-3.5" />}
          />

          {/* Clear Filters button */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Filtreleri Temizle</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2">
          Gösterilen: <strong className="text-slate-800">{filteredIssues.length}</strong> / {issues.length} Görev
        </div>
      </div>

      {/* Kanban Board Canvas */}
      {isLoading && issues.length === 0 ? (
        <div className="py-24 text-center text-xs text-slate-400">İş Akışı panosu yükleniyor...</div>
      ) : !selectedProjectId ? (
        <div className="py-24 text-center text-xs text-slate-400">Lütfen bir proje seçin veya oluşturun.</div>
      ) : (
        <KanbanBoard
          issues={filteredIssues}
          onIssueClick={(issue) => setSelectedIssueId(issue.id)}
          onQuickCreate={handleQuickCreate}
          onIssuesUpdated={fetchBoardData}
        />
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={selectedProjectId || projects[0]?.id}
        projects={projects}
        sprints={sprints}
        members={members}
        defaultSprintId={selectedSprintIds[0] !== 'backlog' ? selectedSprintIds[0] : undefined}
        defaultStatus={createDefaultStatus}
        onIssueCreated={fetchBoardData}
      />

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          issueId={selectedIssueId}
          members={members}
          sprints={sprints}
          onIssueUpdated={fetchBoardData}
          onIssueDeleted={fetchBoardData}
        />
      )}
    </div>
  );
};

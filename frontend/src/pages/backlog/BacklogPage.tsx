import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { projectsApi } from '../../api/projectsApi';
import { issuesApi } from '../../api/issuesApi';
import { sprintsApi } from '../../api/sprintsApi';
import { Issue, Project, ProjectMember, Sprint } from '../../types';
import { SprintSection } from '../../components/backlog/SprintSection';
import { CreateSprintModal } from '../../components/backlog/CreateSprintModal';
import { CreateIssueModal } from '../../components/issues/CreateIssueModal';
import { IssueDetailModal } from '../../components/issues/IssueDetailModal';
import { Button } from '../../components/common/Button';
import { Plus } from 'lucide-react';

export const BacklogPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(selectedProjectIdParam || '');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [createIssueSprintId, setCreateIssueSprintId] = useState<string | undefined>(undefined);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

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

  const fetchBacklogData = useCallback(async () => {
    if (!selectedProjectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [sprintsData, membersData, issuesData] = await Promise.all([
        sprintsApi.getProjectSprints(selectedProjectId),
        projectsApi.getMembers(selectedProjectId),
        issuesApi.getIssues({ projectId: selectedProjectId, pageSize: 200 }),
      ]);

      setSprints(Array.isArray(sprintsData) ? sprintsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setIssues(issuesData?.items || []);
    } catch (e) {
      console.error('Failed to load backlog data', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchBacklogData();
  }, [fetchBacklogData]);

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintsApi.startSprint(sprintId);
      fetchBacklogData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!window.confirm(t('backlog.completeSprintConfirm', 'Bu sprint tamamlansın mı? Açık kalan görevler proje backlog listesine aktarılacaktır.'))) return;
    try {
      await sprintsApi.completeSprint(sprintId);
      fetchBacklogData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to complete sprint');
    }
  };

  const handleQuickAddIssue = (sprintId?: string) => {
    setCreateIssueSprintId(sprintId);
    setIsCreateIssueOpen(true);
  };

  // Group issues by sprint
  const backlogIssues = issues.filter((i) => !i.sprintId);

  return (
    <div className="space-y-6">
      {/* Header & Project Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSearchParams({ project: e.target.value });
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateSprintOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('backlog.createSprint', 'Sprint Oluştur')}
          </Button>

          <Button
            size="sm"
            onClick={() => handleQuickAddIssue(undefined)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('backlog.createIssue', 'Görev Oluştur')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs text-slate-400">{t('backlog.loading', 'Backlog ve sprintler yükleniyor...')}</div>
      ) : !selectedProjectId ? (
        <div className="py-24 text-center text-xs text-slate-400">{t('board.selectProject', 'Lütfen bir proje seçin veya oluşturun.')}</div>
      ) : (
        <div>
          {/* Active & Planned Sprints */}
          {sprints
            .filter((s) => s.status !== 'Completed')
            .map((sprint) => {
              const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
              return (
                <SprintSection
                  key={sprint.id}
                  sprint={sprint}
                  issues={sprintIssues}
                  onIssueClick={(issue) => setSelectedIssueId(issue.id)}
                  onQuickAddIssue={handleQuickAddIssue}
                  onStartSprint={handleStartSprint}
                  onCompleteSprint={handleCompleteSprint}
                />
              );
            })}

          {/* Backlog Section */}
          <SprintSection
            isBacklog
            issues={backlogIssues}
            onIssueClick={(issue) => setSelectedIssueId(issue.id)}
            onQuickAddIssue={handleQuickAddIssue}
          />
        </div>
      )}

      {/* Create Sprint Modal */}
      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        projectId={selectedProjectId || projects[0]?.id}
        projects={projects}
        onSprintCreated={fetchBacklogData}
      />

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        projectId={selectedProjectId || projects[0]?.id}
        projects={projects}
        sprints={sprints}
        members={members}
        defaultSprintId={createIssueSprintId}
        onIssueCreated={fetchBacklogData}
      />

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          issueId={selectedIssueId}
          members={members}
          sprints={sprints}
          onIssueUpdated={fetchBacklogData}
          onIssueDeleted={fetchBacklogData}
        />
      )}
    </div>
  );
};

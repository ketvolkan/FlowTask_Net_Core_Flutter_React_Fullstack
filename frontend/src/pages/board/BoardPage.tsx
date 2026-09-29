import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectsApi } from '../../api/projectsApi';
import { issuesApi } from '../../api/issuesApi';
import { sprintsApi } from '../../api/sprintsApi';
import { Issue, IssuePriority, IssueStatus, IssueType, Project, ProjectMember, Sprint } from '../../types';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { CreateIssueModal } from '../../components/issues/CreateIssueModal';
import { IssueDetailModal } from '../../components/issues/IssueDetailModal';
import { Button } from '../../components/common/Button';
import { Plus, Search } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(selectedProjectIdParam || '');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [search, setSearch] = useState<string>('');

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

  // When selectedProjectId changes, load Sprints, Members, and Issues
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
          sprintId: selectedSprintId || undefined,
          assigneeId: selectedAssigneeId || undefined,
          priority: selectedPriority ? (selectedPriority as IssuePriority) : undefined,
          type: selectedType ? (selectedType as IssueType) : undefined,
          search: search.trim() || undefined,
          pageSize: 150,
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
  }, [selectedProjectId, selectedSprintId, selectedAssigneeId, selectedPriority, selectedType, search]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleProjectChange = (newProjectId: string) => {
    setSelectedProjectId(newProjectId);
    setSearchParams({ project: newProjectId });
    setSelectedSprintId('');
    setSelectedAssigneeId('');
    setSelectedPriority('');
    setSelectedType('');
  };

  const handleQuickCreate = (status: IssueStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Picker */}
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>

          {/* Sprint Filter */}
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Sprints & Backlog</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssigneeId}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Assignees</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.userFullName}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
            <option value="Epic">Epic</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            Create Issue
          </Button>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      {isLoading && issues.length === 0 ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading board...</div>
      ) : !selectedProjectId ? (
        <div className="py-24 text-center text-xs text-slate-400">Please select or create a project.</div>
      ) : (
        <KanbanBoard
          issues={issues}
          onIssueClick={(issue) => setSelectedIssueId(issue.id)}
          onQuickCreate={handleQuickCreate}
          onIssuesUpdated={fetchBoardData}
        />
      )}

      {/* Create Issue Modal */}
      {selectedProjectId && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={selectedProjectId}
          sprints={sprints}
          members={members}
          defaultSprintId={selectedSprintId}
          defaultStatus={createDefaultStatus}
          onIssueCreated={fetchBoardData}
        />
      )}

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

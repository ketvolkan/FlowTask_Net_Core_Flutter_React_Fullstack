import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { issuesApi } from '../../api/issuesApi';
import { projectsApi } from '../../api/projectsApi';
import { sprintsApi } from '../../api/sprintsApi';
import { IssuePriority, IssueStatus, IssueType, Project, ProjectMember, Sprint } from '../../types';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projects?: Project[];
  sprints?: Sprint[];
  members?: ProjectMember[];
  defaultSprintId?: string;
  defaultStatus?: IssueStatus;
  onIssueCreated: () => void;
  onOpenCreateProject?: () => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  projectId: initialProjectId,
  projects = [],
  sprints: initialSprints = [],
  members: initialMembers = [],
  defaultSprintId,
  defaultStatus = 'Todo',
  onIssueCreated,
  onOpenCreateProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [localSprints, setLocalSprints] = useState<Sprint[]>(initialSprints);
  const [localMembers, setLocalMembers] = useState<ProjectMember[]>(initialMembers);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('Task');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [status, setStatus] = useState<IssueStatus>(defaultStatus);
  const [sprintId, setSprintId] = useState<string>(defaultSprintId || '');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setSelectedProjectId(initialProjectId);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
      setStatus(defaultStatus);
      setSprintId(defaultSprintId || '');
      setError(null);
    }
  }, [isOpen, initialProjectId, projects, defaultStatus, defaultSprintId]);

  // Load sprints & members when project changes
  useEffect(() => {
    if (!isOpen || !selectedProjectId) return;

    if (selectedProjectId === initialProjectId && initialSprints.length > 0) {
      setLocalSprints(initialSprints);
      setLocalMembers(initialMembers);
      return;
    }

    const loadMeta = async () => {
      try {
        const [sData, mData] = await Promise.all([
          sprintsApi.getProjectSprints(selectedProjectId),
          projectsApi.getMembers(selectedProjectId),
        ]);
        setLocalSprints(Array.isArray(sData) ? sData : []);
        setLocalMembers(Array.isArray(mData) ? mData : []);
      } catch {
        // ignore
      }
    };
    loadMeta();
  }, [isOpen, selectedProjectId, initialProjectId, initialSprints, initialMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await issuesApi.createIssue(selectedProjectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        status,
        sprintId: sprintId || undefined,
        assigneeId: assigneeId || undefined,
        storyPoints: storyPoints ? Number(storyPoints) : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setTitle('');
      setDescription('');
      setType('Task');
      setPriority('Medium');
      setStatus('Todo');
      setSprintId('');
      setAssigneeId('');
      setStoryPoints(undefined);
      setDueDate('');
      onIssueCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to create issue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Issue"
      description="Create a task, bug, story, or epic for this project."
      size="lg"
    >
      {!selectedProjectId && projects.length === 0 ? (
        <div className="py-6 text-center space-y-4">
          <p className="text-sm text-slate-600">
            No projects available. You must create or join a project before creating issues.
          </p>
          {onOpenCreateProject && (
            <Button
              onClick={() => {
                onClose();
                onOpenCreateProject();
              }}
            >
              Create New Project
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Project Selector if multiple projects */}
          {projects.length > 1 && (
            <Select
              label="Project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add more details, acceptance criteria, or repro steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
            </Select>

            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
            >
              <option value="Todo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="InReview">In Review</option>
              <option value="Done">Done</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {localMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userFullName}
                </option>
              ))}
            </Select>

            <Select
              label="Sprint"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
            >
              <option value="">Backlog (No Sprint)</option>
              {localSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              label="Story Points"
              placeholder="e.g. 1, 2, 3, 5, 8"
              min={0}
              max={100}
              value={storyPoints ?? ''}
              onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
            />

            <Input
              type="date"
              label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Issue
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

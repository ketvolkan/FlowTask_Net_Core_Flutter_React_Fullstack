import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { sprintsApi } from '../../api/sprintsApi';
import { Project } from '../../types';

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projects?: Project[];
  onSprintCreated: () => void;
  onOpenCreateProject?: () => void;
}

export const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
  isOpen,
  onClose,
  projectId: initialProjectId,
  projects = [],
  onSprintCreated,
  onOpenCreateProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [name, setName] = useState('Sprint 1');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setSelectedProjectId(initialProjectId);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
      setError(null);
    }
  }, [isOpen, initialProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    if (!name.trim()) {
      setError('Sprint name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sprintsApi.createSprint(selectedProjectId, {
        name: name.trim(),
        goal: goal.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });

      setName('Sprint 1');
      setGoal('');
      setStartDate('');
      setEndDate('');
      onSprintCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to create sprint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sprint"
      description="Plan sprint cycles, duration, and main goals."
    >
      {!selectedProjectId && projects.length === 0 ? (
        <div className="py-6 text-center space-y-4">
          <p className="text-sm text-slate-600">
            No projects available. You must create or join a project before creating sprints.
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
            label="Sprint Name"
            placeholder="e.g. Sprint 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Sprint Goal
            </label>
            <textarea
              rows={2}
              placeholder="What is the team committing to achieve this sprint?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Sprint
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

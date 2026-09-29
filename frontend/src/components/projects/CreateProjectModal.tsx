import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { projectsApi } from '../../api/projectsApi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-generate key if key hasn't been manually heavily edited
    if (!key || key.length <= 4) {
      const autoKey = newName
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 4)
        .toUpperCase();
      setKey(autoKey);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      setError('Project name and key are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await projectsApi.createProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
      });
      setName('');
      setKey('');
      setDescription('');
      onProjectCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Create a project to organize issues, sprints, and team members."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Project Name"
          placeholder="e.g. Platform Engineering"
          value={name}
          onChange={handleNameChange}
          required
        />

        <Input
          label="Project Key (2-10 characters)"
          placeholder="e.g. PLAT"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          maxLength={10}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Brief description of the project goal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { ProjectRoleBadge } from '../common/Badge';
import { projectsApi } from '../../api/projectsApi';
import { ProjectMember, ProjectRole } from '../../types';
import { UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<ProjectRole>('Member');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getMembers(projectId);
      setMembers(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to fetch project members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId, fetchMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      await projectsApi.addMember(projectId, {
        userId: newUserId.trim(),
        role: newRole,
      });
      setNewUserId('');
      fetchMembers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (memberUserId: string, role: ProjectRole) => {
    try {
      await projectsApi.updateMemberRole(projectId, memberUserId, role);
      setMembers((prev) =>
        prev.map((m) => (m.userId === memberUserId ? { ...m, role } : m))
      );
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    try {
      await projectsApi.removeMember(projectId, memberUserId);
      setMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Members"
      description="Manage access and roles for this project."
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex items-end gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              User ID (Guid)
            </label>
            <input
              type="text"
              placeholder="e.g. 00000000-0000-0000-0000-000000000000"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="w-36">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as ProjectRole)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <Button type="submit" size="sm" isLoading={isAdding} leftIcon={<UserPlus className="h-4 w-4" />}>
            Add
          </Button>
        </form>

        {/* Members List */}
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No members found.</div>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={m.userFullName} avatarUrl={m.userAvatarUrl} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-900">{m.userFullName}</p>
                      {m.userId === user?.id && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{m.userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {m.role === 'Owner' ? (
                    <ProjectRoleBadge role={m.role} />
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.userId, e.target.value as ProjectRole)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  )}

                  {m.role !== 'Owner' && m.userId !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { User } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Badge } from '../../components/common/Badge';
import { UserPlus, Search, Trash2, Edit, Shield, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Create Form State
  const [createFullName, setCreateFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createJobTitle, setCreateJobTitle] = useState('');
  const [createDepartment, setCreateDepartment] = useState('');
  const [createIsAdmin, setCreateIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllUsers(1, 100);
      setUsers(data?.items || []);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFullName.trim() || !createEmail.trim() || !createPassword) {
      setCreateError('Please fill in required fields');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const roles = createIsAdmin ? ['Admin', 'Member'] : ['Member'];
      await adminApi.createUser({
        fullName: createFullName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        jobTitle: createJobTitle.trim() || undefined,
        department: createDepartment.trim() || undefined,
        roles,
      });

      setCreateFullName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateJobTitle('');
      setCreateDepartment('');
      setCreateIsAdmin(false);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setCreateError(e.response?.data?.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditFullName(user.fullName);
    setEditJobTitle(user.jobTitle || '');
    setEditDepartment(user.department || '');
    setEditIsActive(user.isActive);
    setEditIsAdmin(user.roles?.includes('Admin') || false);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const roles = editIsAdmin ? ['Admin', 'Member'] : ['Member'];
      await adminApi.updateUser(selectedUser.id, {
        fullName: editFullName.trim(),
        jobTitle: editJobTitle.trim() || undefined,
        department: editDepartment.trim() || undefined,
        isActive: editIsActive,
        roles,
      });

      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user', err);
      alert('Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}?`)) return;
    try {
      await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Delete user failed', err);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="mt-1 text-xs text-slate-500">
            Create, inspect, and configure system roles and accounts.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add New User
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name, email, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Job Title / Dept</th>
                <th className="px-6 py-3.5">System Roles</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users matched your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.fullName} avatarUrl={u.avatarUrl} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <p className="font-medium text-slate-800">{u.jobTitle || '—'}</p>
                      <p className="text-[11px] text-slate-400">{u.department || '—'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <Badge
                              key={r}
                              variant={r === 'Admin' ? 'purple' : 'default'}
                            >
                              {r === 'Admin' && <Shield className="mr-1 h-3 w-3 inline" />}
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <Badge>Member</Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          <X className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullName)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New User"
        description="Create a new account with specified roles."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {createError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {createError}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Jane Smith"
            value={createFullName}
            onChange={(e) => setCreateFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@company.com"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Architect"
              value={createJobTitle}
              onChange={(e) => setCreateJobTitle(e.target.value)}
            />

            <Input
              label="Department"
              placeholder="e.g. Engineering"
              value={createDepartment}
              onChange={(e) => setCreateDepartment(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="createIsAdmin"
              checked={createIsAdmin}
              onChange={(e) => setCreateIsAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="createIsAdmin" className="text-xs font-semibold text-slate-800">
              Grant System Administrator Privileges
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit User: ${selectedUser.fullName}`}
          description="Update account profile and system permissions."
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <Input
              label="Full Name"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Job Title"
                value={editJobTitle}
                onChange={(e) => setEditJobTitle(e.target.value)}
              />

              <Input
                label="Department"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="editIsActive" className="text-xs font-semibold text-slate-800">
                  Account is Active
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsAdmin"
                  checked={editIsAdmin}
                  onChange={(e) => setEditIsAdmin(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="editIsAdmin" className="text-xs font-semibold text-slate-800">
                  Grant System Administrator Role
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

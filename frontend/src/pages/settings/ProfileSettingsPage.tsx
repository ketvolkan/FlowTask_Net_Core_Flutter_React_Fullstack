import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { axiosClient } from '../../api/axiosClient';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Badge } from '../../components/common/Badge';
import { User, Lock, Save, Shield } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await axiosClient.put('/users/profile', {
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim() || undefined,
        department: department.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      setProfileSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setProfileError(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      await axiosClient.post('/users/change-password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPasswordError(e.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your personal details, workspace preferences, and security credentials.
        </p>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{user?.fullName}</h3>
              {user?.isSystemAdmin && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user?.roles?.map((r) => (
                <Badge key={r} variant="purple">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          <User className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {profileSuccess && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200">
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {profileError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Avatar Image URL"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              placeholder="e.g. Lead Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />

            <Input
              label="Department"
              placeholder="e.g. Core Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              isLoading={isUpdatingProfile}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          <Lock className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          {passwordSuccess && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {passwordError}
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              isLoading={isChangingPassword}
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

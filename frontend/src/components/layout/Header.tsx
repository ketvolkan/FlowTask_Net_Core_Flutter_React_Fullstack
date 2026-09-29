import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { NotificationDropdown } from './NotificationDropdown';
import { LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <UserAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="sm" />
            <div className="hidden text-left md:block pr-1">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.jobTitle || 'Member'}</p>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 border border-slate-100 py-1 divide-y divide-slate-100 animate-scale-in">
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                {user?.isSystemAdmin && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> System Admin
                  </span>
                )}
              </div>

              <div className="py-1">
                <Link
                  to="/settings/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  Account Settings
                </Link>
                {user?.isSystemAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-slate-400" />
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

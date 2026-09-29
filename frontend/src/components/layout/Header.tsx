import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAvatar } from '../common/UserAvatar';
import { NotificationDropdown } from './NotificationDropdown';
import {
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  PlusCircle,
  FolderPlus,
  UserPlus,
  Search,
  Activity,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenCreateProject?: () => void;
  onOpenCreateIssue?: () => void;
  onOpenAddMember?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenCreateProject,
  onOpenCreateIssue,
  onOpenAddMember,
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isSysAdmin = !!user?.isSystemAdmin;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global hotkey Ctrl+K / ⌘K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/board?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-6 backdrop-blur-sm gap-3">
      {/* Left: Hamburger Toggle & Global Quick Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none shrink-0"
          title={t('common.toggleSidebar', 'Menüyü Aç/Kapat')}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Input with Shortcut */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('header.searchPlaceholder', 'Görevlerde, projelerde ara...')}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-14 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <span className="absolute right-2.5 top-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 shadow-2xs pointer-events-none">
            ⌘K
          </span>
        </form>
      </div>

      {/* Right: Quick Action Buttons, Notifications & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Actions for Company / Normal Users */}
        {!isSysAdmin && (
          <div className="flex items-center gap-2">
            {/* Desktop Direct Action Buttons */}
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={onOpenCreateIssue}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{t('header.newIssue', 'Görev Oluştur')}</span>
              </button>

              <button
                onClick={onOpenCreateProject}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
                <span>{t('header.newProject', 'Yeni Proje')}</span>
              </button>

              <button
                onClick={onOpenAddMember}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('header.addMember', 'Üye Ekle')}</span>
              </button>
            </div>

            {/* Mobile / Compact Quick Action Dropdown */}
            <div className="relative xl:hidden" ref={quickActionsRef}>
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('header.quickActions', 'Hızlı İşlem')}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {isQuickActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 border border-slate-100 py-1 divide-y divide-slate-100 animate-scale-in">
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      onOpenCreateIssue?.();
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{t('header.newIssue', 'Görev Oluştur')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      onOpenCreateProject?.();
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors text-left"
                  >
                    <FolderPlus className="h-4 w-4 text-slate-600" />
                    <span>{t('header.newProject', 'Yeni Proje')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      onOpenAddMember?.();
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <UserPlus className="h-4 w-4 text-slate-500" />
                    <span>{t('header.addMember', 'Üye Ekle')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions for Super Admin */}
        {isSysAdmin && (
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/admin/users"
              className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{t('header.adminAddUser', 'Kullanıcı Yönetimi')}</span>
            </Link>

            <Link
              to="/admin/logs"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Activity className="h-3.5 w-3.5 text-slate-500" />
              <span>{t('header.adminLogs', 'Sistem Logları')}</span>
            </Link>
          </div>
        )}

        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <UserAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="sm" />
            <div className="hidden text-left lg:block pr-1">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{user?.fullName}</p>
              <p className="text-[11px] text-slate-500 capitalize truncate max-w-[120px]">{user?.jobTitle || 'Member'}</p>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 border border-slate-100 py-1 divide-y divide-slate-100 animate-scale-in">
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                {user?.isSystemAdmin && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> {t('header.systemAdmin', 'Sistem Yöneticisi')}
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
                  {t('header.accountSettings', 'Hesap Ayarları')}
                </Link>
                {user?.isSystemAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-slate-400" />
                    {t('header.adminPanel', 'Yönetici Paneli')}
                  </Link>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  {t('header.signOut', 'Çıkış Yap')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

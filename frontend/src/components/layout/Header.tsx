import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
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
  Building2,
  Check,
  Globe,
  Megaphone,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthorizedUser } from '../../utils/permissionUtils';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenCreateProject?: () => void;
  onOpenCreateIssue?: () => void;
  onOpenAddMember?: () => void;
  onOpenSendNotification?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenCreateProject,
  onOpenCreateIssue,
  onOpenAddMember,
  onOpenSendNotification,
  onOpenSearch,
}) => {
  const { user, logout } = useAuth();
  const {
    selectedCompanyId,
    selectedCompany,
    availableCompanies,
    hasMultipleCompanies,
    userCompanyName,
    setSelectedCompanyId,
  } = useCompany();
  const { t } = useLanguage();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isSysAdmin = !!user?.isSystemAdmin;
  const isAuthorized = isAuthorizedUser(user);

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

  // Global hotkey Ctrl+K / ⌘K to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-6 backdrop-blur-sm gap-3">
      {/* Left: Hamburger Toggle & Company Card Selector / Badge */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none shrink-0 cursor-pointer"
          title={t('common.toggleSidebar', 'Menüyü Aç/Kapat')}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* 3 Interactive Cards for Multi-Company Users (No Dropdown, No Scroll) */}
        {hasMultipleCompanies ? (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 shrink-0">
            {availableCompanies.map((comp) => {
              const isSelected = comp.id === selectedCompanyId;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(comp.id)}
                  title={comp.description}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold shrink-0 ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {comp.id === 'all' ? <Globe className="h-2.5 w-2.5" /> : comp.code.slice(0, 2)}
                  </div>
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{comp.shortName}</span>
                  {isSelected && <Check className="h-3 w-3 text-white shrink-0 ml-0.5" />}
                </button>
              );
            })}
          </div>
        ) : (
          /* Single Company Users: Simple clean company identity badge */
          userCompanyName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span className="truncate max-w-[180px]">{userCompanyName}</span>
            </div>
          )
        )}

        {/* Global Interactive Search Input Trigger with Shortcut */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="relative w-full hidden md:flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-400 hover:bg-white hover:border-slate-300 hover:text-slate-600 transition-all max-w-xs ml-2 cursor-pointer text-left shadow-2xs group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            <span className="truncate">{t('header.searchPlaceholder', 'Görevlerde, projelerde ara...')}</span>
          </div>
          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 shadow-2xs pointer-events-none group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: Quick Action Buttons, Notifications & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl md:hidden focus:outline-none cursor-pointer"
          title="Arama Yap (Ctrl+K)"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Quick Actions for Company / Normal Users */}
        {!isSysAdmin && (
          <div className="flex items-center gap-2">
            {/* Desktop Direct Action Buttons */}
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={onOpenCreateIssue}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{t('header.newIssue', 'Görev Oluştur')}</span>
              </button>

              {isAuthorized && (
                <>
                  <button
                    onClick={onOpenCreateProject}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{t('header.newProject', 'Yeni Proje')}</span>
                  </button>

                  <button
                    onClick={onOpenAddMember}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                    <span>{t('header.addMember', 'Üye Ekle')}</span>
                  </button>

                  <button
                    onClick={onOpenSendNotification}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer"
                  >
                    <Megaphone className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{t('notifications.sendBtnShort', 'Duyuru Gönder')}</span>
                  </button>
                </>
              )}
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

                  {isAuthorized && (
                    <>
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

                      <button
                        onClick={() => {
                          setIsQuickActionsOpen(false);
                          onOpenSendNotification?.();
                        }}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <Megaphone className="h-4 w-4 text-indigo-600" />
                        <span>{t('notifications.sendBtnShort', 'Duyuru Gönder')}</span>
                      </button>
                    </>
                  )}
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
            className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
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
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
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

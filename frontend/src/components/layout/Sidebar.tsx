import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Layers,
  Shield,
  Settings,
  X,
  PlusCircle,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const isSysAdmin = !!user?.isSystemAdmin;

  const navLinks = isSysAdmin
    ? [
        { name: t('nav.adminOverview', 'Yönetici Özeti'), path: '/admin', icon: Shield },
        { name: t('nav.adminUsers', 'Kullanıcı Yönetimi'), path: '/admin/users', icon: Users },
        { name: t('nav.adminProjects', 'Şirket Projeleri'), path: '/admin/projects', icon: FolderKanban },
        { name: t('nav.adminLogs', 'Sistem Logları'), path: '/admin/logs', icon: Activity },
        { name: t('nav.settings', 'Profil Ayarları'), path: '/settings/profile', icon: Settings },
      ]
    : [
        { name: t('nav.dashboard', 'Kontrol Paneli'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('nav.projects', 'Projeler'), path: '/projects', icon: FolderKanban },
        { name: t('nav.board', 'İş Akışı'), path: '/board', icon: Kanban },
        { name: t('nav.backlog', 'Sprintler & Backlog'), path: '/backlog', icon: Layers },
        { name: t('nav.team', 'Ekip & Aktif Kullanıcılar'), path: '/team', icon: Users },
        { name: t('nav.settings', 'Profil Ayarları'), path: '/settings/profile', icon: Settings },
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`flex h-16 items-center border-b border-slate-100 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md shrink-0 ${isSysAdmin ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-500/20'}`}>
              {isSysAdmin ? <Shield className="h-5 w-5" /> : <Kanban className="h-5 w-5" />}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden transition-opacity duration-200">
                <span className="text-base font-bold tracking-tight text-slate-900">FLOW<span className="text-indigo-600">TASK</span></span>
                <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
                  {isSysAdmin ? 'Super Admin' : 'Management'}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button only */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isSysAdmin ? t('nav.adminPanel', 'Yönetim Konsolu') : t('nav.navigation', 'Menü')}
            </div>
          )}
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl py-2.5 text-xs font-medium transition-all ${
                    isCollapsed ? 'justify-center px-2' : 'px-3.5'
                  } ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Language Switcher & App Info */}
        <div className={`border-t border-slate-100 p-3 space-y-2.5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <LanguageSwitcher />

          {!isCollapsed && (
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-center">
              <p className="text-[11px] font-semibold text-slate-700">Flowtask v1.0.0</p>
              <p className="text-[10px] text-slate-400">{t('nav.enterprise', 'Kurumsal Proje Yönetimi')}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

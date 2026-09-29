import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Layers,
  Shield,
  Settings,
  X,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProject?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenCreateProject,
}) => {
  const { user } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Kanban Board', path: '/board', icon: Kanban },
    { name: 'Sprints & Backlog', path: '/backlog', icon: Layers },
    { name: 'Profile Settings', path: '/settings/profile', icon: Settings },
  ];

  if (user?.isSystemAdmin) {
    navLinks.splice(4, 0, { name: 'Admin Console', path: '/admin', icon: Shield });
  }

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
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
              <Kanban className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">FLOW<span className="text-indigo-600">TASK</span></span>
              <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Management</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <button
            onClick={onOpenCreateProject}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-indigo-400" />
            New Project
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-700">Flowtask v1.0.0</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Enterprise Project Management</p>
          </div>
        </div>
      </aside>
    </>
  );
};

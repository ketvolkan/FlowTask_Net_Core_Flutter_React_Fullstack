import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('flowtask_sidebar_collapsed') === 'true';
  });
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('flowtask_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      toggleSidebarCollapse();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsMobileSidebarOpen(false)}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={handleToggleSidebar} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 bg-slate-50">
          <div className="w-full max-w-[1920px] mx-auto px-1 sm:px-2">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
          <div className="mx-auto max-w-7xl">
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

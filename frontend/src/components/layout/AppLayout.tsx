import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { CreateIssueModal } from '../issues/CreateIssueModal';
import { GlobalAddMemberModal } from '../projects/GlobalAddMemberModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { IssueDetailModal } from '../issues/IssueDetailModal';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('flowtask_sidebar_collapsed') === 'true';
  });

  // Global Action Modals
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedSearchIssueId, setSelectedSearchIssueId] = useState<string | null>(null);

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
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          onToggleSidebar={handleToggleSidebar}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenCreateIssue={() => setIsCreateIssueOpen(true)}
          onOpenAddMember={() => setIsAddMemberOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 bg-slate-50">
          <div className="w-full max-w-[1920px] mx-auto px-1 sm:px-2">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectIssue={(issueId) => {
          setSelectedSearchIssueId(issueId);
        }}
      />

      {/* Direct Task Detail Modal from Search */}
      {selectedSearchIssueId && (
        <IssueDetailModal
          isOpen={!!selectedSearchIssueId}
          onClose={() => setSelectedSearchIssueId(null)}
          issueId={selectedSearchIssueId}
          onIssueUpdated={() => {
            // Optional callback on issue update
          }}
          onIssueDeleted={() => {
            setSelectedSearchIssueId(null);
          }}
        />
      )}

      {/* Global Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={() => {
          window.location.reload();
        }}
      />

      {/* Global Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        onIssueCreated={() => {
          window.location.reload();
        }}
      />

      {/* Global Add Member Modal */}
      <GlobalAddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </div>
  );
};

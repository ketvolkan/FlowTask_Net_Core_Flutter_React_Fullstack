import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesApi } from '../../api/issuesApi';
import { projectsApi } from '../../api/projectsApi';
import { useLanguage } from '../../context/LanguageContext';
import { useCompany } from '../../context/CompanyContext';
import { Issue, Project } from '../../types';
import { StatusBadge, PriorityBadge, TypeBadge } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import {
  Search,
  X,
  Kanban,
  FolderKanban,
  Layers,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  Command,
  CheckCircle2,
  Calendar,
  Building2,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIssue: (issueId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectIssue,
}) => {
  const { t } = useLanguage();
  const { selectedCompany, filterProjectsByCompany } = useCompany();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'issues' | 'projects'>('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      fetchAllData(search);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const fetchAllData = async (query: string) => {
    setIsLoading(true);
    try {
      const [issuesRes, projectsRes] = await Promise.all([
        issuesApi.getIssues({
          search: query.trim() || undefined,
          pageSize: 20,
        }),
        projectsApi.getProjects(1, 20),
      ]);

      setIssues(issuesRes?.items || []);
      setProjects(projectsRes?.items || []);
    } catch (e) {
      console.error('Failed to query search results', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchAllData(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  // Company filtering
  const displayedProjects = filterProjectsByCompany(projects).filter((p) =>
    search.trim()
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.key.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const displayedIssues = issues.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.key.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  });

  const totalResults =
    activeTab === 'issues'
      ? displayedIssues.length
      : activeTab === 'projects'
      ? displayedProjects.length
      : displayedIssues.length + displayedProjects.length;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalResults, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70 gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('search.placeholder', 'Görev ara (örn: FLOW-1, JWT, API, Tasarım)...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 shadow-2xs">
            ESC
          </span>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('common.all', 'Tümü')} ({displayedIssues.length + displayedProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'issues'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('search.issues', 'Görevler')} ({displayedIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('search.projects', 'Projeler')} ({displayedProjects.length})
            </button>
          </div>

          {selectedCompany.id !== 'all' && (
            <span className="text-[11px] text-slate-400 font-medium">
              Şirket: <strong className="text-slate-600">{selectedCompany.name}</strong>
            </span>
          )}
        </div>

        {/* Results List */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-3 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2" />
              <p>{t('search.searching', 'Görevler ve projeler aranıyor...')}</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Search className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">{t('search.noResultsTitle', 'Sonuç Bulunamadı')}</p>
              <p className="mt-1 text-slate-400">"{search}" aramasıyla eşleşen bir görev veya proje yok.</p>
            </div>
          ) : (
            <>
              {/* Issues Section */}
              {(activeTab === 'all' || activeTab === 'issues') && displayedIssues.length > 0 && (
                <div className="space-y-1.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Kanban className="h-3.5 w-3.5" />
                    <span>{t('search.matchingTasks', 'Eşleşen Görevler')} ({displayedIssues.length})</span>
                  </div>

                  <div className="space-y-1">
                    {displayedIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => {
                          onClose();
                          onSelectIssue(issue.id);
                        }}
                        className="p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="mt-0.5">
                            <TypeBadge type={issue.type} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-indigo-600 group-hover:underline">
                                {issue.key}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700">
                                {issue.title}
                              </span>
                            </div>

                            {issue.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {issue.description}
                              </p>
                            )}

                            <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                              <StatusBadge status={issue.status} />
                              <PriorityBadge priority={issue.priority} />

                              {issue.assigneeName && (
                                <div className="flex items-center gap-1 text-slate-600">
                                  <UserAvatar name={issue.assigneeName} avatarUrl={issue.assigneeAvatarUrl} size="xs" />
                                  <span className="text-[10px] font-medium truncate max-w-[100px]">{issue.assigneeName}</span>
                                </div>
                              )}

                              {issue.storyPoints && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                  {issue.storyPoints} SP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {(activeTab === 'all' || activeTab === 'projects') && displayedProjects.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>{t('search.matchingProjects', 'Eşleşen Projeler')} ({displayedProjects.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayedProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onClose();
                          navigate(`/projects/${p.id}`);
                        }}
                        className="p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-[11px] shrink-0">
                            {p.key.slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.memberCount} üye • {p.issueCount} görev
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Quick Shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-700">↵</span> Seç / Aç
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-700">ESC</span> Kapat
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              navigate(`/board?search=${encodeURIComponent(search.trim())}`);
            }}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Tüm Sonuçları Panoda Aç →
          </button>
        </div>
      </div>
    </div>
  );
};

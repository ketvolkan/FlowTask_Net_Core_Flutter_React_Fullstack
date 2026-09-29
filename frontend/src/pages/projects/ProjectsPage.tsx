import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { projectsApi } from '../../api/projectsApi';
import { Project } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Kanban,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getProjects(1, 100);
      setProjects(data?.items || []);
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = (projects || []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('projects.title', 'Projeler')}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {t('projects.subtitle', 'Panosunu, sprintlerini ve ekibini incelemek için bir proje seçin.')}
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {t('projects.createProject', 'Proje Oluştur')}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder={t('projects.searchPlaceholder', 'Proje adı veya anahtarı ile arayın...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">{t('common.loading', 'Yükleniyor...')}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-800">{t('projects.noProjectsFound', 'Henüz proje bulunamadı')}</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {t('projects.noProjectsDesc', 'Görevleri, sprintleri ve ekip iş akışını organize etmek için ilk projenizi oluşturun.')}
          </p>
          <Button
            className="mt-4"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('projects.createProject', 'Proje Oluştur')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                    {project.key.slice(0, 3)}
                  </div>
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
                    {project.key}
                  </span>
                </div>

                <Link to={`/projects/${project.id}`}>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                  {project.description || t('projects.noDescription', 'Açıklama belirtilmemiş.')}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" />
                    {project.memberCount} {t('dashboard.membersCount', 'üye')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    {project.issueCount} {t('dashboard.issuesCount', 'görev')}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/board?project=${project.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                    title={t('projects.openBoard', 'Pano')}
                  >
                    <Kanban className="h-3.5 w-3.5" />
                    {t('projects.openBoard', 'Pano')}
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link
                    to={`/backlog?project=${project.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                    title={t('projects.openBacklog', 'Backlog')}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    {t('projects.openBacklog', 'Backlog')}
                  </Link>
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Project } from '../../types';
import { Input } from '../../components/common/Input';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

export const AdminProjectsPage: React.FC = () => {
  const { t, isTurkish } = useLanguage();
  const dateLocale = isTurkish ? trLocale : enUS;

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllProjects(1, 100);
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

  const handleDeleteProject = async (projectId: string, name: string) => {
    if (!window.confirm(`${name} ${t('admin.deleteProjectConfirm', 'adlı projeyi kalıcı olarak silmek istediğinize emin misiniz?')}`)) return;
    try {
      await adminApi.deleteProject(projectId);
      fetchProjects();
    } catch (e) {
      console.error('Failed to delete project', e);
      alert(t('admin.deleteFailed', 'Failed to delete project'));
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('admin.projectGovernance', 'Project Governance')}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {t('admin.projectsSubtitle', 'Manage, inspect, or remove workspaces across the entire platform.')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder={t('admin.searchProjectsPlaceholder', 'Search by project name, key, or owner...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">{t('admin.tableProject', 'Project')}</th>
                <th className="px-6 py-3.5">{t('admin.tableKey', 'Key')}</th>
                <th className="px-6 py-3.5">{t('admin.tableOwner', 'Owner')}</th>
                <th className="px-6 py-3.5">{t('admin.tableMembers', 'Members')}</th>
                <th className="px-6 py-3.5">{t('admin.tableIssues', 'Issues')}</th>
                <th className="px-6 py-3.5">{t('admin.tableCreated', 'Created')}</th>
                <th className="px-6 py-3.5 text-right">{t('admin.tableActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {t('admin.loadingProjects', 'Loading projects...')}
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {t('admin.noProjectsFound', 'No projects found.')}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shrink-0">
                          {p.key.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {p.description || t('projects.noDescription', 'No description')}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                        {p.key}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {p.ownerName}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {p.memberCount}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {p.issueCount}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(p.createdAt), 'd MMM yyyy', { locale: dateLocale })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/projects/${p.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title={t('projects.openBoard', 'Open project')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title={t('common.delete', 'Delete project')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

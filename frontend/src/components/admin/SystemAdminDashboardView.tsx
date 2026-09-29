import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getUserCompany, ALL_COMPANIES } from '../../context/CompanyContext';
import { adminApi } from '../../api/adminApi';
import { User, SystemStatistics, ActivityLog } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  FolderKanban,
  Shield,
  Search,
  Activity,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { tr as dateFnsTr, enUS as dateFnsEn } from 'date-fns/locale';

export const SystemAdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const dateLocale = language === 'tr' ? dateFnsTr : dateFnsEn;

  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');

  useEffect(() => {
    const loadSystemData = async () => {
      try {
        setIsLoading(true);
        const [statsData, usersData, logsData] = await Promise.all([
          adminApi.getStatistics().catch(() => null),
          adminApi.getAllUsers(1, 100).catch(() => ({ items: [], totalCount: 0 })),
          adminApi.getActivityLogs(undefined, 1, 8).catch(() => ({ items: [], totalCount: 0 })),
        ]);

        if (statsData) setStats(statsData);
        setUsers(usersData?.items || []);
        setRecentLogs(logsData?.items || []);
      } catch (err) {
        console.error('Failed to load system admin data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemData();
  }, []);

  // Compute Company breakdown from users list
  const companyDistribution = useMemo(() => {
    const distribution: Record<string, { name: string; code: string; count: number; activeCount: number; color: string }> = {};

    users.forEach((u) => {
      const comp = getUserCompany(u);
      if (!distribution[comp.name]) {
        distribution[comp.name] = {
          name: comp.name,
          code: comp.code,
          count: 0,
          activeCount: 0,
          color: comp.color,
        };
      }
      distribution[comp.name].count += 1;
      if (u.isActive) {
        distribution[comp.name].activeCount += 1;
      }
    });

    return Object.values(distribution);
  }, [users]);

  // Filtered Users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const comp = getUserCompany(u);

      const matchesCompany =
        selectedCompanyFilter === 'all' ||
        comp.name.toLowerCase().includes(selectedCompanyFilter.toLowerCase()) ||
        comp.code.toLowerCase() === selectedCompanyFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        comp.name.toLowerCase().includes(q);

      return matchesCompany && matchesSearch;
    });
  }, [users, selectedCompanyFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Super Admin Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/30 px-3.5 py-1 text-xs font-semibold text-purple-200 border border-purple-400/30">
              <Shield className="h-3.5 w-3.5 text-purple-300" />
              <span>Sistem Yönetim Paneli • Super Admin</span>
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashboard.welcome', 'Tekrar hoş geldin')}, {user?.fullName}!
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-purple-200/80 max-w-2xl">
              Platforma kayıtlı tüm kullanıcılar, bağlı oldukları şirketler, sistem rolleri ve şirket bazlı dağılım istatistikleri.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 shadow-md hover:bg-purple-50 transition-colors"
            >
              <UserPlus className="h-4 w-4 text-purple-700" />
              <span>Kullanıcı Yönetimi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered Users */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('admin.totalUsers', 'Kayıtlı Kullanıcılar')}
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{stats?.totalUsers ?? users.length}</p>
          <p className="mt-1 text-xs text-slate-400">
            {stats?.activeUsers ?? users.filter((u) => u.isActive).length} aktif hesap
          </p>
        </div>

        {/* Metric 2: Registered Companies */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kayıtlı Şirketler
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {companyDistribution.length || ALL_COMPANIES.filter((c) => c.id !== 'all').length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Aktif organizasyon / kiracı</p>
        </div>

        {/* Metric 3: Platform Projects */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('admin.totalProjects', 'Sistem Projeleri')}
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{stats?.totalProjects ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Tüm şirketlerdeki çalışma alanları</p>
        </div>

        {/* Metric 4: System Logs */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sistem Denetimi
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{recentLogs.length}</p>
          <p className="mt-1 text-xs text-slate-400">Son kaydedilen aktivite</p>
        </div>
      </div>

      {/* Company Distribution Summary Cards */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-purple-50 p-2 text-purple-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Şirketler ve Kullanıcı Dağılımı</h3>
              <p className="text-xs text-slate-500">Sistemdeki şirketlerin kullanıcı sayıları ve üye oranları</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {companyDistribution.map((comp) => {
            const isFilterActive =
              selectedCompanyFilter !== 'all' &&
              comp.name.toLowerCase().includes(selectedCompanyFilter.toLowerCase());

            return (
              <button
                key={comp.name}
                type="button"
                onClick={() => setSelectedCompanyFilter(isFilterActive ? 'all' : comp.name)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isFilterActive
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {comp.code}
                  </span>
                  <span className="text-xs font-bold text-indigo-700">{comp.count} Kullanıcı</span>
                </div>
                <h4 className="mt-2.5 text-xs font-bold text-slate-900 truncate">{comp.name}</h4>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Aktif Hesap:</span>
                  <span className="font-semibold text-emerald-600">{comp.activeCount} aktif</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section: Registered Users & Their Companies Directory */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Sisteme Kayıtlı Kullanıcılar ve Şirketleri ({filteredUsers.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sistemdeki tüm kayıtlı kullanıcılar, şirket bilgileri, departmanları ve yetkileri
            </p>
          </div>

          <Link
            to="/admin/users"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Tüm Kullanıcıları Yönet</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Search and Company Quick Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="İsim, e-posta, şirket veya departmana göre ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setSelectedCompanyFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCompanyFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tüm Şirketler
            </button>
            {companyDistribution.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedCompanyFilter(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCompanyFilter === c.name
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-150">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kullanıcı</th>
                <th className="py-3 px-4">Şirket</th>
                <th className="py-3 px-4">Departman / Ünvan</th>
                <th className="py-3 px-4">Sistem Rolü</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Kullanıcılar yükleniyor...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                    Arama kriterlerine uygun kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const comp = getUserCompany(u);
                  const isSysAdmin = u.isSystemAdmin || u.roles?.includes('Admin');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.fullName} avatarUrl={u.avatarUrl} size="sm" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company Badge */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                          <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[150px]">{comp.name}</span>
                        </div>
                      </td>

                      {/* Department & Job Title */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{u.department || '—'}</p>
                        <p className="text-[11px] text-slate-400">{u.jobTitle || 'Üye'}</p>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5 px-4">
                        {isSysAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Shield className="h-3 w-3" />
                            Sistem Yöneticisi
                          </span>
                        ) : u.roles && u.roles.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {u.roles[0]}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            Kullanıcı
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <XCircle className="h-3 w-3 text-rose-600" />
                            Pasif
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u.createdAt ? (
                          <span>
                            {formatDistanceToNow(new Date(u.createdAt), {
                              addSuffix: true,
                              locale: dateLocale,
                            })}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs Preview */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Son Sistem Denetim Logları</h3>
          </div>
          <Link
            to="/admin/logs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Tüm Logları İncele</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loglar yükleniyor...</div>
        ) : recentLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">Kayıtlı log bulunamadı.</div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                    {log.action}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">{log.userFullName || 'Kullanıcı'}</span>
                    <span className="text-slate-500 ml-1.5">{log.details || log.entityType}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: dateLocale })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { ActivityLog } from '../../types';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, Activity } from 'lucide-react';
import { format } from 'date-fns';

export const AdminLogsPage: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getActivityLogs(undefined, 1, 100);
      setLogs(data?.items || []);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('admin.auditLogs', 'Audit & Activity Logs')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('admin.logsSubtitle', 'Full traceability of all mutations, issue transitions, and project events.')}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          {t('admin.refreshLogs', 'Refresh Logs')}
        </Button>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">{t('admin.tableAction', 'Action')}</th>
                <th className="px-6 py-3.5">{t('admin.tableEntity', 'Entity')}</th>
                <th className="px-6 py-3.5">{t('admin.tableDetails', 'Details')}</th>
                <th className="px-6 py-3.5">{t('admin.user', 'User')}</th>
                <th className="px-6 py-3.5">{t('admin.tableTimestamp', 'Timestamp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {t('admin.loadingLogs', 'Loading audit logs...')}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {t('admin.noLogs', 'No activity logs recorded yet.')}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {log.entityType}
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      {log.details || '—'}
                    </td>

                    <td className="px-6 py-3.5 text-slate-500">
                      {log.userFullName || log.userId}
                    </td>

                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
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

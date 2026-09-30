import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, BellRing, ExternalLink, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

export const UrgentAlertModal: React.FC = () => {
  const { urgentAlert, dismissUrgentAlert } = useNotification();
  const { isTurkish } = useLanguage();
  const navigate = useNavigate();
  const dateLocale = isTurkish ? trLocale : enUS;

  if (!urgentAlert) return null;

  const handleAction = () => {
    if (urgentAlert.linkUrl) {
      navigate(urgentAlert.linkUrl);
    }
    dismissUrgentAlert();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-3xl shadow-2xl ring-1 ring-rose-500/30 border border-rose-100 animate-scale-in">
        
        {/* Top Warning Banner / Header */}
        <div className="relative bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner animate-bounce">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white text-rose-700 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                  Önemli Sistem Bildirimi / Acil Uyarı
                </span>
                <h3 className="mt-1 text-lg font-bold text-white leading-tight">
                  {urgentAlert.title}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-100/80 text-rose-950">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {urgentAlert.message}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <BellRing className="h-3.5 w-3.5 text-rose-500" />
              <span>{isTurkish ? 'Anlık Bildirim' : 'Live Notification'}</span>
            </div>
            <span>
              {urgentAlert.createdAt
                ? formatDistanceToNow(new Date(urgentAlert.createdAt), { addSuffix: true, locale: dateLocale })
                : 'Az önce'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          {urgentAlert.linkUrl && (
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-100/70 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>İlgili Sayfayı Aç</span>
            </button>
          )}

          <button
            type="button"
            onClick={dismissUrgentAlert}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Anladım ve Kapat</span>
          </button>
        </div>

      </div>
    </div>
  );
};

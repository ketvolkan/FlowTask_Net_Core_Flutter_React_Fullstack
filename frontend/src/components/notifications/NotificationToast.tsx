import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, CheckSquare, MessageSquare, RefreshCw, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

export const NotificationToast: React.FC = () => {
  const { recentToast, dismissToast, markAsRead } = useNotification();
  const { isTurkish } = useLanguage();
  const navigate = useNavigate();
  const dateLocale = isTurkish ? trLocale : enUS;

  if (!recentToast) return null;

  const handleClick = () => {
    markAsRead(recentToast.id);
    if (recentToast.linkUrl) {
      navigate(recentToast.linkUrl);
    }
    dismissToast();
  };

  const getIcon = () => {
    switch (recentToast.type) {
      case 'IssueAssigned':
        return <CheckSquare className="h-5 w-5 text-indigo-600" />;
      case 'IssueStatusChanged':
        return <RefreshCw className="h-5 w-5 text-emerald-600" />;
      case 'CommentAdded':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-2xl border border-indigo-100 ring-1 ring-black/5 flex items-start gap-3">
        
        {/* Type Icon Container */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            {recentToast.title}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
            {recentToast.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400">
              {recentToast.createdAt
                ? formatDistanceToNow(new Date(recentToast.createdAt), { addSuffix: true, locale: dateLocale })
                : isTurkish ? 'Az önce' : 'Just now'}
            </span>
            {recentToast.linkUrl && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600">
                <ExternalLink className="h-2.5 w-2.5" />
                {isTurkish ? 'Aç' : 'Open'}
              </span>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={dismissToast}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
};

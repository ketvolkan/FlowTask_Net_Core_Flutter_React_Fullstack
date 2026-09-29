import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { isAuthorizedUser } from '../../utils/permissionUtils';
import { SendNotificationModal } from '../notifications/SendNotificationModal';
import { Bell, Check, CheckCheck, Megaphone, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const { t, isTurkish } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotification();
  const dateLocale = isTurkish ? trLocale : enUS;
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canSend = isAuthorizedUser(user);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: typeof notifications[0]) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    if (n.linkUrl) {
      setIsOpen(false);
      navigate(n.linkUrl);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
          title={t('notifications.title', 'Notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 border border-slate-200/80 animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('notifications.title', 'Bildirimler')}
                </h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    {unreadCount} {t('notifications.new', 'yeni')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canSend && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsSendModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-bold px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-colors cursor-pointer"
                    title={t('notifications.sendBroadcast', 'Duyuru / Bildirim Gönder')}
                  >
                    <Megaphone className="h-3 w-3" />
                    <span>{t('notifications.sendBtnShort', 'Duyuru')}</span>
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>{t('notifications.markAllRead', 'Tümünü Oku')}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {t('notifications.empty', 'Henüz bildiriminiz yok.')}
                </div>
              ) : (
                notifications.map((n) => {
                  const isUrgent =
                    n.type === 'UrgentAlert' ||
                    n.type === 'SystemAlert' ||
                    n.type?.toLowerCase().includes('alert');

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                        !n.isRead
                          ? isUrgent
                            ? 'bg-rose-50/60 border-l-4 border-rose-500'
                            : 'bg-indigo-50/40 border-l-4 border-indigo-500'
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isUrgent ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded uppercase">
                              <ShieldAlert className="h-2.5 w-2.5" />
                              Acil Uyarı
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded uppercase">
                              <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                              {n.type || 'Sistem'}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 break-words line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">
                            {n.createdAt
                              ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })
                              : 'Az önce'}
                          </span>
                          {n.linkUrl && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600">
                              <ExternalLink className="h-2.5 w-2.5" />
                              Aç
                            </span>
                          )}
                        </div>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="rounded-full p-1 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                          title={t('notifications.markAsRead', 'Okundu olarak işaretle')}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Authorized Send Notification Modal */}
      {canSend && (
        <SendNotificationModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          onSent={refreshNotifications}
        />
      )}
    </>
  );
};

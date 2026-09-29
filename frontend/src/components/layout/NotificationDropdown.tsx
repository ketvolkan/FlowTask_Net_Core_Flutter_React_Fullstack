import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../../api/notificationsApi';
import { Notification } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

export const NotificationDropdown: React.FC = () => {
  const { t, isTurkish } = useLanguage();
  const dateLocale = isTurkish ? trLocale : enUS;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getUserNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 border border-slate-200/80 animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 text-sm">
                {t('notifications.title', 'Notifications')}
              </h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {unreadCount} {t('notifications.new', 'new')}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('notifications.empty', 'No notifications right now.')}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 ${
                    !n.isRead ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 break-words line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="rounded-full p-1 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      title={t('notifications.markAsRead', 'Mark as read')}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

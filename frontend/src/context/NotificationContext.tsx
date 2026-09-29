import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../api/notificationsApi';
import { signalRService } from '../services/signalrService';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  urgentAlert: Notification | null;
  recentToast: Notification | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissUrgentAlert: () => void;
  dismissToast: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [urgentAlert, setUrgentAlert] = useState<Notification | null>(null);
  const [recentToast, setRecentToast] = useState<Notification | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationsApi.getUserNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.isRead);
      setUnreadCount(unread.length);

      // Check if there is an unread urgent alert that hasn't been acknowledged
      const unreadUrgent = unread.find(
        (n) => n.type === 'UrgentAlert' || n.type === 'SystemAlert' || n.type.toLowerCase().includes('alert')
      );
      if (unreadUrgent && !sessionStorage.getItem(`acknowledged_alert_${unreadUrgent.id}`)) {
        setUrgentAlert(unreadUrgent);
      }
    } catch (err) {
      console.error('Failed to fetch initial notifications', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      signalRService.startConnection();

      // Listen for standard real-time notifications
      const unsubNotif = signalRService.onNotification((newNotif) => {
        setNotifications((prev) => {
          // Avoid duplicate entry
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount((prev) => prev + 1);

        // Show floating toast for non-urgent notifications
        const isUrgent =
          newNotif.type === 'UrgentAlert' ||
          newNotif.type === 'SystemAlert' ||
          newNotif.type.toLowerCase().includes('alert');

        if (!isUrgent) {
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          setRecentToast(newNotif);
          toastTimeoutRef.current = setTimeout(() => {
            setRecentToast(null);
          }, 6000);
        }
      });

      // Listen for urgent alert popups
      const unsubAlert = signalRService.onUrgentAlert((alert) => {
        setUrgentAlert(alert);
      });

      return () => {
        unsubNotif();
        unsubAlert();
        signalRService.stopConnection();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setUrgentAlert(null);
      setRecentToast(null);
      signalRService.stopConnection();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (urgentAlert && urgentAlert.id === id) {
        setUrgentAlert(null);
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setUrgentAlert(null);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const dismissUrgentAlert = () => {
    if (urgentAlert) {
      sessionStorage.setItem(`acknowledged_alert_${urgentAlert.id}`, 'true');
      markAsRead(urgentAlert.id);
    }
    setUrgentAlert(null);
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setRecentToast(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        urgentAlert,
        recentToast,
        markAsRead,
        markAllAsRead,
        dismissUrgentAlert,
        dismissToast,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  urgentAlert: null,
  recentToast: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  dismissUrgentAlert: () => {},
  dismissToast: () => {},
  refreshNotifications: async () => {},
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  return context || defaultNotificationContext;
};

import { axiosClient } from './axiosClient';
import { ApiResponse, Notification } from '../types';

export interface SendNotificationPayload {
  title: string;
  message: string;
  type?: number;
  linkUrl?: string;
  targetType: 'All' | 'SpecificUsers' | 'Department' | 'Company';
  targetUserIds?: string[];
  department?: string;
  companyName?: string;
}

export const notificationsApi = {
  getUserNotifications: async (): Promise<Notification[]> => {
    const { data } = await axiosClient.get<ApiResponse<Notification[]>>('/notifications');
    return data.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await axiosClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.patch('/notifications/read-all');
  },

  sendNotification: async (payload: SendNotificationPayload): Promise<{ message: string }> => {
    const { data } = await axiosClient.post('/notifications/send', payload);
    return data;
  },
};

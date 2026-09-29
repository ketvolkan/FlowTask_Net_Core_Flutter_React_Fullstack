import { axiosClient } from './axiosClient';
import { ApiResponse, Notification } from '../types';

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
};

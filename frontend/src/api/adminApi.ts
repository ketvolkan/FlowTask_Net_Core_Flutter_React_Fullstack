import { axiosClient } from './axiosClient';
import { ActivityLog, ApiResponse, PagedResponse, Project, SystemStatistics, User } from '../types';
import { normalizePagedResponse } from './apiHelpers';

export const adminApi = {
  getStatistics: async (): Promise<SystemStatistics> => {
    const { data } = await axiosClient.get<ApiResponse<SystemStatistics>>('/admin/statistics');
    return data.data;
  },

  getAllUsers: async (page = 1, pageSize = 20): Promise<PagedResponse<User>> => {
    const { data } = await axiosClient.get<ApiResponse<any>>('/admin/users', {
      params: { page, pageSize },
    });
    return normalizePagedResponse<User>(data.data ?? data);
  },

  createUser: async (userData: {
    email: string;
    password: string;
    fullName: string;
    jobTitle?: string;
    department?: string;
    roles?: string[];
  }): Promise<User> => {
    const { data } = await axiosClient.post<ApiResponse<User>>('/admin/users', userData);
    return data.data;
  },

  updateUser: async (
    userId: string,
    userData: {
      fullName: string;
      avatarUrl?: string;
      jobTitle?: string;
      department?: string;
      isActive: boolean;
      roles?: string[];
    }
  ): Promise<User> => {
    const { data } = await axiosClient.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
    return data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await axiosClient.delete(`/admin/users/${userId}`);
  },

  getAllProjects: async (page = 1, pageSize = 20): Promise<PagedResponse<Project>> => {
    const { data } = await axiosClient.get<ApiResponse<any>>('/admin/projects', {
      params: { page, pageSize },
    });
    return normalizePagedResponse<Project>(data.data ?? data);
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await axiosClient.delete(`/admin/projects/${projectId}`);
  },

  getActivityLogs: async (projectId?: string, page = 1, pageSize = 50): Promise<PagedResponse<ActivityLog>> => {
    const { data } = await axiosClient.get<ApiResponse<any>>('/admin/activity-logs', {
      params: { projectId, page, pageSize },
    });
    return normalizePagedResponse<ActivityLog>(data.data ?? data);
  },
};

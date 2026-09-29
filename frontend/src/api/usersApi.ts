import { axiosClient } from './axiosClient';
import { ApiResponse, PagedResponse, User } from '../types';
import { normalizePagedResponse } from './apiHelpers';

export const usersApi = {
  getUsers: async (page = 1, pageSize = 100): Promise<PagedResponse<User>> => {
    const { data } = await axiosClient.get<ApiResponse<any>>('/users', {
      params: { page, pageSize },
    });
    return normalizePagedResponse<User>(data.data ?? data);
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await axiosClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },
};

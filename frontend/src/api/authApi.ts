import { axiosClient } from './axiosClient';
import { ApiResponse, AuthUser, TokenResponse } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<TokenResponse> => {
    const { data } = await axiosClient.post<ApiResponse<TokenResponse>>('/auth/login', credentials);
    return data.data;
  },

  register: async (registerData: {
    email: string;
    password: string;
    fullName: string;
    jobTitle?: string;
    department?: string;
  }): Promise<TokenResponse> => {
    const { data } = await axiosClient.post<ApiResponse<TokenResponse>>('/auth/register', registerData);
    return data.data;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const { data } = await axiosClient.get<ApiResponse<AuthUser>>('/auth/me');
    return data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('flowtask_refresh_token');
    if (refreshToken) {
      try {
        await axiosClient.post('/auth/revoke-token', { refreshToken });
      } catch (e) {
        console.error('Revoke token failed', e);
      }
    }
    localStorage.removeItem('flowtask_access_token');
    localStorage.removeItem('flowtask_refresh_token');
    localStorage.removeItem('flowtask_user');
  },
};

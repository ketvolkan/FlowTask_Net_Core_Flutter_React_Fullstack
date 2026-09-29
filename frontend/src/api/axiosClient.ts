import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach accessToken
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowtask_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto refresh token on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('flowtask_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('flowtask_access_token');
        localStorage.removeItem('flowtask_refresh_token');
        localStorage.removeItem('flowtask_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        if (data?.success && data?.data?.accessToken) {
          const newToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;

          localStorage.setItem('flowtask_access_token', newToken);
          localStorage.setItem('flowtask_refresh_token', newRefreshToken);

          axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('flowtask_access_token');
        localStorage.removeItem('flowtask_refresh_token');
        localStorage.removeItem('flowtask_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { resolveMockRequest } from './mock/adapter';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Bearer token & Request ID
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('forge_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.headers) {
    config.headers['x-request-id'] = uuidv4();
  }
  return config;
});

// Response Interceptor: Auto Token Refresh & Graceful Mock Fallback
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    // Graceful offline mock fallback if backend is offline or mocks explicitly enabled
    const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true';
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message.includes('Network Error');

    if ((isMockEnabled || isNetworkError) && originalRequest) {
      let parsedData: unknown = undefined;
      try {
        if (typeof originalRequest.data === 'string') {
          parsedData = JSON.parse(originalRequest.data);
        } else {
          parsedData = originalRequest.data;
        }
      } catch {
        parsedData = originalRequest.data;
      }

      const mockRes = resolveMockRequest(
        originalRequest.method || 'GET',
        originalRequest.url || '',
        parsedData
      );

      if (mockRes) {
        return mockRes;
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('forge_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('forge_access_token');
        localStorage.removeItem('forge_refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const { data } = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        localStorage.setItem('forge_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('forge_refresh_token', newRefreshToken);
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('forge_access_token');
        localStorage.removeItem('forge_refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ApiEnvelope, TokenResponse } from '../types/auth';

/**
 * Base API URL for backend communication
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * Strictly in-memory access token storage (Never stored in localStorage or sessionStorage)
 */
let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

/**
 * Axios instance configured with cookie transmission
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for httpOnly refreshToken cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Injects in-memory Bearer token into Authorization header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Mutex and Queue for handling silent concurrent token refreshes
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
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

// Callback hook for AuthContext to detect session expiration
let onSessionExpiredCallback: (() => void) | null = null;

export function setOnSessionExpiredCallback(callback: () => void) {
  onSessionExpiredCallback = callback;
}

/**
 * Response Interceptor: Catches 401s on protected endpoints and executes silent refresh queue
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If there is no response or error is not 401, reject immediately
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do NOT intercept auth endpoints to prevent infinite refresh loops
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/google') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // If another request is already refreshing the token, queue this request
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

    try {
      // Execute the single refresh request using direct axios call with credentials
      const refreshResponse = await axios.post<ApiEnvelope<TokenResponse>>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = refreshResponse.data?.data?.access_token;
      if (!newAccessToken) {
        throw new Error('Refresh endpoint did not return an access token.');
      }

      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);

      if (onSessionExpiredCallback) {
        onSessionExpiredCallback();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

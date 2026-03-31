import axios from 'axios';
import { clearSession } from '../utils/session';

// In development: set VITE_API_URL=http://localhost:8081 in frontend/.env.local
// In Docker: leave unset — Nginx proxies /api/* to the backend container
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshRequest = null;

function shouldAttemptRefresh(error) {
  const status = error.response?.status;
  const originalRequest = error.config ?? {};
  const requestUrl = originalRequest.url ?? '';

  return status === 401
    && !originalRequest._retry
    && requestUrl !== '/api/auth/refresh'
    && requestUrl !== '/api/auth/login'
    && requestUrl !== '/api/auth/register'
    && requestUrl !== '/api/auth/logout';
}

async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = refreshClient.post('/api/auth/refresh')
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

export async function handleAuthFailure(error) {
  if (shouldAttemptRefresh(error)) {
    const originalRequest = error.config;
    originalRequest._retry = true;

    try {
      await refreshSession();
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  }

  if (error.response?.status === 401) {
    clearSession();
  }

  return Promise.reject(error);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  handleAuthFailure,
);

export const API_BASE = API_BASE_URL;
export default axiosInstance;

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

export function handleAuthFailure(error) {
  if (error.response?.status === 401 || error.response?.status === 403) {
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

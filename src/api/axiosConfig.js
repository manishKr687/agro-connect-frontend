import axios from 'axios';
import { clearSession } from '../utils/session';

// In development: set REACT_APP_API_URL=http://localhost:8081 in frontend/.env.local
// In Docker: leave unset — Nginx proxies /api/* to the backend container
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  },
);

export const API_BASE = API_BASE_URL;
export default axiosInstance;

import axios from 'axios';

// In development: set REACT_APP_API_URL=http://localhost:8081 in frontend/.env.local
// In Docker: leave unset — Nginx proxies /api/* to the backend container
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const API_BASE = API_BASE_URL;
export default axiosInstance;

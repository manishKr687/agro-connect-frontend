import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081'; // Use localhost for local development

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

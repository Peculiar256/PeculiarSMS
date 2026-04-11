import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create the main axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[AXIOS] Adding token to request:', config.method.toUpperCase(), config.url);
    } else {
      console.warn('[AXIOS] No token found in localStorage for request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('[AXIOS] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response OK:', response.config.method.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('[AXIOS] Response error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    if (error.response?.status === 401) {
      console.error('[AXIOS] Unauthorized (401) - Token may be expired');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const schoolAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

schoolAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const schoolService = {
  getSchool: async () => {
    try {
      const response = await schoolAPI.get('/school');
      return response.data;
    } catch (error) {
      console.error('Error fetching school settings:', error);
      return { success: false, data: null, hasSchool: false };
    }
  },

  saveSchool: async (schoolData) => {
    try {
      const response = await schoolAPI.put('/school', schoolData);
      return response.data;
    } catch (error) {
      console.error('Error saving school settings:', error);
      throw error;
    }
  },
};

export default schoolService;

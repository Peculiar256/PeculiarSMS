import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
          refreshToken,
        });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return authAPI(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Login - supports both email and ID-based login
  // email: can be email or null (for ID login)
  // password: user password
  // identifier: student/teacher ID (optional, for ID-based login)
  login: (email, password, identifier = null) => {
    const loginData = {};
    
    if (identifier) {
      // ID-based login
      loginData.identifier = identifier;
    } else if (email) {
      // Email-based login (backward compatible)
      loginData.email = email;
      loginData.identifier = email;
    } else {
      throw new Error('Either email or identifier must be provided');
    }
    
    loginData.password = password;
    
    return authAPI.post('/login', loginData);
  },

  // Register
  register: (userData) =>
    authAPI.post('/register', userData),

  // Forgot Password
  forgotPassword: (email) =>
    authAPI.post('/forgot-password', { email }),

  // Reset Password
  resetPassword: (token, newPassword) =>
    authAPI.post('/reset-password', { token, newPassword }),

  // Verify Email
  verifyEmail: (token) =>
    authAPI.post('/verify-email', { token }),

  // Resend Verification Token
  resendToken: (email, tokenType) =>
    authAPI.post('/resend-token', { email, tokenType }),

  // Change Password
  changePassword: (currentPassword, newPassword) =>
    authAPI.put('/change-password', { currentPassword, newPassword }),

  // Refresh Token
  refreshToken: (refreshToken) =>
    authAPI.post('/refresh-token', { refreshToken }),

  // Update profile
  updateProfile: (profileData) =>
    authAPI.put('/profile', profileData),

  // Store tokens and user
  setTokens: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get access token
  getAccessToken: () => localStorage.getItem('accessToken'),

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => !!localStorage.getItem('accessToken'),

  // Get user role
  getUserRole: () => {
    const user = authService.getUser();
    return user?.role || null;
  },

  // Refresh user profile from backend
  refreshUserProfile: async () => {
    try {
      const response = await authAPI.get('/me');
      const user = response.data;
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (err) {
      // Silently fail - user can continue with stored profile
      // If token is invalid, the next API call will trigger token refresh
      if (err.response?.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
      }
      return null;
    }
  },
};

export default authService;

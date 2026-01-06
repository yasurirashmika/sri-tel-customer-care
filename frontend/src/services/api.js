import axios from 'axios';

// API Gateway URL
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICE ====================
export const authService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await api.post('/api/auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

// ==================== USER SERVICE ====================
export const userService = {
  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  
  getUserByMobile: async (mobileNumber) => {
    const response = await api.get(`/api/users/mobile/${mobileNumber}`);
    return response.data;
  },
  
  updateUser: async (id, data) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },
};

export default api;
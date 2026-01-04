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

export const authService = {
  register: async (data) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.post('/user-service/api/auth/register', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  login: async (data) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await api.post('/user-service/api/auth/login', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const userService = {
  getUserById: async (id) => {
    const response = await api.get(`/user-service/api/users/${id}`);
    return response.data;
  },
  
  getUserByMobile: async (mobileNumber) => {
    const response = await api.get(`/user-service/api/users/mobile/${mobileNumber}`);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/user-service/api/users');
    return response.data;
  },
  
  updateUser: async (id, data) => {
    const response = await api.put(`/user-service/api/users/${id}`, data);
    return response.data;
  },
};

export default api;
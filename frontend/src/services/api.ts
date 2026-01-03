import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

export const userService = {
  getUserById: async (id: number): Promise<any> => {
    const response = await api.get<any>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: any): Promise<any> => {
    const response = await api.put<any>(`/users/${id}`, data);
    return response.data;
  },
};

export const notificationService = {
  getUserNotifications: async (userId: number): Promise<any> => {
    const response = await api.get<any>(`/notifications/user/${userId}`);
    return response.data;
  },

  sendNotification: async (data: any): Promise<any> => {
    const response = await api.post<any>('/notifications', data);
    return response.data;
  },
};

export default api;
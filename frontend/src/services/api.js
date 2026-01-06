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

// ==================== BILLING SERVICE ====================
export const billingService = {
  getUserBills: async (userId) => {
    const response = await api.get(`/api/bills/user/${userId}`);
    return response.data;
  },

  getBillById: async (billId) => {
    const response = await api.get(`/api/bills/${billId}`);
    return response.data;
  },

  getBillByNumber: async (billNumber) => {
    const response = await api.get(`/api/bills/number/${billNumber}`);
    return response.data;
  },

  getUnpaidBills: async (userId) => {
    const response = await api.get(`/api/bills/user/${userId}/unpaid`);
    return response.data;
  },

  generateBill: async (userId) => {
    const response = await api.post(`/api/bills/generate/${userId}`);
    return response.data;
  },

  getBillsByMobile: async (mobileNumber) => {
    const response = await api.get(`/api/bills/mobile/${mobileNumber}`);
    return response.data;
  },
};

// ==================== PAYMENT SERVICE ====================
export const paymentService = {
  processPayment: async (paymentData) => {
    const response = await api.post('/api/payments/process', paymentData);
    return response.data;
  },

  getUserPayments: async (userId) => {
    const response = await api.get(`/api/payments/user/${userId}`);
    return response.data;
  },

  getPaymentById: async (paymentId) => {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response.data;
  },

  getPaymentByTransaction: async (transactionId) => {
    const response = await api.get(`/api/payments/transaction/${transactionId}`);
    return response.data;
  },

  getPaymentsByBill: async (billId) => {
    const response = await api.get(`/api/payments/bill/${billId}`);
    return response.data;
  },
};

// ==================== SERVICE ACTIVATION ====================
export const serviceActivationService = {
  activateService: async (serviceData) => {
    const response = await api.post('/api/services/activate', serviceData);
    return response.data;
  },

  deactivateService: async (serviceId) => {
    const response = await api.post(`/api/services/deactivate/${serviceId}`);
    return response.data;
  },

  getUserServices: async (userId) => {
    const response = await api.get(`/api/services/user/${userId}`);
    return response.data;
  },

  getActiveServices: async (userId) => {
    const response = await api.get(`/api/services/user/${userId}/active`);
    return response.data;
  },

  getServiceById: async (serviceId) => {
    const response = await api.get(`/api/services/${serviceId}`);
    return response.data;
  },
};

// ==================== CHAT SERVICE ====================
export const chatService = {
  createChatRoom: async (userId) => {
    const response = await api.post(`/api/chat/room/create?userId=${userId}`);
    return response.data;
  },

  getChatRoom: async (roomId) => {
    const response = await api.get(`/api/chat/room/${roomId}`);
    return response.data;
  },

  getChatHistory: async (roomId) => {
    const response = await api.get(`/api/chat/room/${roomId}/messages`);
    return response.data;
  },

  closeChatRoom: async (roomId) => {
    const response = await api.post(`/api/chat/room/${roomId}/close`);
    return response.data;
  },

  getUserChatRooms: async (userId) => {
    const response = await api.get(`/api/chat/user/${userId}/rooms`);
    return response.data;
  },
};

// ==================== NOTIFICATION SERVICE (Optional) ====================
export const notificationService = {
  getUserNotifications: async (userId) => {
    try {
      const response = await api.get(`/api/notifications/users/${userId}`);
      return { available: true, data: response.data };
    } catch (error) {
      console.warn('Notification service unavailable:', error?.response?.status || error.message);
      return { available: false, data: [] };
    }
  },
};

export default api;
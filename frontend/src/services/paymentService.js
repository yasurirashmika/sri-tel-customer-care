import api from './api';

const paymentService = {
  processPayment: async (paymentData) => {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  },

  getUserPayments: async (userId) => {
    const response = await api.get(`/payments/user/${userId}`);
    return response.data;
  },

  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};

export default paymentService;
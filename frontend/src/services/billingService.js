import api from './api';

const billingService = {
  // Get all bills for a user
  getUserBills: async (userId) => {
    // 👇 Fixed: Added /api prefix
    const response = await api.get(`/api/bills/user/${userId}`);
    return response.data;
  },

  // Get bill by ID
  getBillById: async (billId) => {
    const response = await api.get(`/api/bills/${billId}`);
    return response.data;
  },

  // Get unpaid bills
  getUnpaidBills: async (userId) => {
    const response = await api.get(`/api/bills/user/${userId}/unpaid`);
    return response.data;
  },

  // Generate a new bill
  generateBill: async (userId) => {
    const response = await api.post(`/api/bills/generate/${userId}`);
    return response.data;
  },
};

export default billingService;
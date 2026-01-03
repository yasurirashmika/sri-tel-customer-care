import api from './api';

const billingService = {
  // Get all bills for a user
  getUserBills: async (userId) => {
    const response = await api.get(`/bills/user/${userId}`);
    return response.data;
  },

  // Get bill by ID
  getBillById: async (billId) => {
    const response = await api.get(`/bills/${billId}`);
    return response.data;
  },

  // Get bill by bill number
  getBillByNumber: async (billNumber) => {
    const response = await api.get(`/bills/number/${billNumber}`);
    return response.data;
  },

  // Get unpaid bills for a user
  getUnpaidBills: async (userId) => {
    const response = await api.get(`/bills/user/${userId}/unpaid`);
    return response.data;
  },

  // Generate a new bill
  generateBill: async (userId) => {
    const response = await api.post(`/bills/generate/${userId}`);
    return response.data;
  },

  // Get bills by mobile number
  getBillsByMobile: async (mobileNumber) => {
    const response = await api.get(`/bills/mobile/${mobileNumber}`);
    return response.data;
  },
};

export default billingService;
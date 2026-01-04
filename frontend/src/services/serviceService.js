import api from './api';

const serviceService = {
  // Get all services for a user
  getUserServices: async (userId) => {
    const response = await api.get(`/services/user/${userId}`);
    return response.data;
  },

  // Activate a service
  activateService: async (serviceData) => {
    const response = await api.post('/services/activate', serviceData);
    return response.data;
  },

  // Deactivate a service
  deactivateService: async (serviceId) => {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  },

  // Get service details
  getServiceById: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },
};

export default serviceService;
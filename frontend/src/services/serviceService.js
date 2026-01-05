import api from './api';

const serviceService = {
  // Get all services for a user
  getUserServices: async (userId) => {
    const response = await api.get(`/api/services/user/${userId}`);
    return response.data;
  },
  
  // Activate a service
  activateService: async (serviceData) => {
    const response = await api.post('/api/services/activate', serviceData);
    return response.data;
  },
  
  // Deactivate a service
  deactivateService: async (serviceId) => {
    const response = await api.post(`/api/services/deactivate/${serviceId}`);
    return response.data;
  },
  
  // Get service details by id
  getServiceById: async (serviceId) => {
    const response = await api.get(`/api/services/${serviceId}`);
    return response.data;
  },
};

export default serviceService;
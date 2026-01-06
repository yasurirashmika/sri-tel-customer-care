import api from './api';

// ==================== NOTIFICATION SERVICE ====================
const notificationService = {
  getUserNotifications: async (userId) => {
    try {
      const response = await api.get(`/api/notifications/users/${userId}`);
      return { available: true, data: response.data };
    } catch (error) {
      console.warn('Notification service unavailable:', error?.response?.status || error.message);
      return { available: false, data: [] };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export default notificationService;

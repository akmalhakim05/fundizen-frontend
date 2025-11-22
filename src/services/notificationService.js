// src/services/notificationService.js
import api from './api';

/**
 * Notification Service
 * Handles Expo push notifications & token management
 */
const notificationService = {

  /**
   * 54. Send Expo Push Notification (Admin only)
   * POST /api/notifications/send-expo
   */
  sendExpoPushNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications/send-expo', notificationData);
      return response.data;
    } catch (error) {
      console.error('Failed to send Expo push notification:', error);
      throw error.response?.data || { message: 'Failed to send notification' };
    }
  },

  /**
   * 55. Check if User Has Registered Expo Push Token
   * GET /api/notifications/token/{userId}
   */
  checkUserNotificationToken: async (userId) => {
    try {
      const response = await api.get(`/notifications/token/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to check notification token for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to check notification token' };
    }
  },
};

export default notificationService;
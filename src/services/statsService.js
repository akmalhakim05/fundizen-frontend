// src/services/statsService.js
import api from './api';

/**
 * Statistics & Analytics Service
 * Covers all /api/stats/* endpoints (Campaign, Donation, FoodBank, Pickup)
 */
const statsService = {
  // ==================== CAMPAIGN STATS ====================

  /**
  * GET /api/stats/campaigns/{id}?includeAnalytics=true&days=30
   */
  getCampaignStats: async (campaignId, days = 30) => {
    try {
      const response = await api.get(`/stats/campaigns/${campaignId}`, {
        params: { includeAnalytics: true, days },
      });
      return response.data.statistics; // backend returns { success: true, statistics: { ... } }
    } catch (error) {
      console.error(`Failed to fetch full stats for campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to load campaign statistics' };
    }
  },

  // ==================== PLATFORM & DONATION STATS ====================

  /**
   * GET /api/stats/donations?months=12
  **/

  getPlatformDonationStats: async (months = 12) => {
    try {
      const response = await api.get('/stats/donations', {
        params: { months },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch consolidated donation stats:', error);
      throw error.response?.data || { message: 'Failed to load platform donation statistics' };
    }
  },

  /**
   * 29. Get Donation Analytics (Admin Dashboard)
   * GET /api/stats/donations/analytics
   */
  getDonationAnalytics: async () => {
    try {
      const response = await api.get('/stats/donations/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch donation analytics:', error);
      throw error.response?.data || { message: 'Failed to load donation analytics' };
    }
  },

  // ==================== FOOD BANK STATS ====================

  /**
   * 30. Global Food Bank Statistics
   * GET /api/stats/foodbank
   */
  getGlobalFoodBankStats: async () => {
    try {
      const response = await api.get('/stats/foodbank');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global food bank stats:', error);
      throw error.response?.data || { message: 'Failed to load food bank statistics' };
    }
  },

  /**
   * 31. User Food Bank Statistics
   * GET /api/stats/foodbank/user/{userId}
   */
  getUserFoodBankStats: async (userId) => {
    try {
      const response = await api.get(`/stats/foodbank/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch food bank stats for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to load user food bank stats' };
    }
  },

  /**
   * 32. Food Bank Distribution Statistics
   * GET /api/stats/foodbank/distribution
   */
  getFoodBankDistributionStats: async () => {
    try {
      const response = await api.get('/stats/foodbank/distribution');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch food bank distribution stats:', error);
      throw error.response?.data || { message: 'Failed to load distribution statistics' };
    }
  },

  // ==================== PICKUP STATS ====================

  /**
   * 33. Global Pickup Statistics
   * GET /api/stats/pickup
   */
  getGlobalPickupStats: async () => {
    try {
      const response = await api.get('/stats/pickup');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global pickup stats:', error);
      throw error.response?.data || { message: 'Failed to load pickup statistics' };
    }
  },

  /**
   * 34. User Pickup Statistics
   * GET /api/stats/pickup/user/{userId}
   */
  getUserPickupStats: async (userId) => {
    try {
      const response = await api.get(`/stats/pickup/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pickup stats for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to load user pickup stats' };
    }
  },

  /**
   * 35. Food Bank Pickup Statistics
   * GET /api/stats/pickup/foodbank/{foodBankId}
   */
  getFoodBankPickupStats: async (foodBankId) => {
    try {
      const response = await api.get(`/stats/pickup/foodbank/${foodBankId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pickup stats for food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to load food bank pickup stats' };
    }
  },

  /**
   * 36. Pickup Distribution Statistics
   * GET /api/stats/pickup/distribution
   */
  getPickupDistributionStats: async () => {
    try {
      const response = await api.get('/stats/pickup/distribution');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pickup distribution stats:', error);
      throw error.response?.data || { message: 'Failed to load pickup distribution statistics' };
    }
  },
};

export default statsService;


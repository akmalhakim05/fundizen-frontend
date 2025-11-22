// src/services/statsService.js
import api from './api';

/**
 * Statistics & Analytics Service
 * Covers all /api/stats/* endpoints (Campaign, Donation, FoodBank, Pickup)
 */
const statsService = {
  // ==================== CAMPAIGN STATS ====================

  /**
   * 24. Get Campaign Statistics
   * GET /api/stats/campaigns/{id}
   */
  getCampaignStats: async (campaignId) => {
    try {
      const response = await api.get(`/stats/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stats for campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to load campaign statistics' };
    }
  },

  /**
   * 25. Get Campaign Analytics (with optional days)
   * GET /api/stats/campaigns/{id}/analytics?days=30
   */
  getCampaignAnalytics: async (campaignId, days = 30) => {
    try {
      const response = await api.get(`/stats/campaigns/${campaignId}/analytics`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch analytics for campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to load campaign analytics' };
    }
  },

  // ==================== PLATFORM & DONATION STATS ====================

  /**
   * 26. Get Platform Donation Statistics
   * GET /api/stats/donations/platform
   */
  getPlatformDonationStats: async () => {
    try {
      const response = await api.get('/stats/donations/platform');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform donation stats:', error);
      throw error.response?.data || { message: 'Failed to load platform donation statistics' };
    }
  },

  /**
   * 27. Get Top Donors for a Campaign
   * GET /api/stats/donations/campaigns/{campaignId}/top-donors?limit=10
   */
  getTopDonors: async (campaignId, limit = 10) => {
    try {
      const response = await api.get(`/stats/donations/campaigns/${campaignId}/top-donors`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch top donors for campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to load top donors' };
    }
  },

  /**
   * 28. Get Donation Trends (monthly)
   * GET /api/stats/donations/trends?months=12
   */
  getDonationTrends: async (months = 12) => {
    try {
      const response = await api.get('/stats/donations/trends', {
        params: { months },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch donation trends:', error);
      throw error.response?.data || { message: 'Failed to load donation trends' };
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


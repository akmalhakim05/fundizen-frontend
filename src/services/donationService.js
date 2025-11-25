// src/services/donationService.js
import api from './api';

const donationService = {
  // ===== ADMIN: ALL DONATIONS (with full filtering) =====
  /**
   * Get all donations with pagination and filters (Admin Panel)
   * GET /api/donations?page=0&size=20&sortBy=createdAt&sortDir=desc&status=succeeded&campaignId=...&userId=...
   */
  getAllDonations: async (filters = {}) => {
    try {
      const response = await api.get('/admin/donations', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching all donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== Get single donation by ID =====
  getDonationById: async (donationId) => {
    try {
      const response = await api.get(`/donations/${donationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching donation ${donationId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== Get donations for a specific campaign =====
  getCampaignDonations: async (campaignId, options = {}) => {
    try {
      const params = {
        page: options.page ?? 0,
        size: options.size ?? 20,
        sortBy: options.sortBy || 'createdAt',
        sortDir: options.sortDir || 'desc',
        includePrivate: options.includePrivate ?? false,
        ...options,
      };

      const response = await api.get(`/donations/campaign/${campaignId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching donations for campaign ${campaignId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== Get donations made by a specific donor =====
  getDonorDonations: async (userId, page = 0, size = 20) => {
    try {
      const response = await api.get(`/donations/donor/${userId}`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching donations for donor ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== Get donations with messages (for campaign wall) =====
  getDonationsWithMessages: async (campaignId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/donations/campaign/${campaignId}/messages`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching message donations for campaign ${campaignId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== Get recent donations across the platform =====
  getRecentDonations: async (limit = 10, hours = 24) => {
    try {
      const response = await api.get('/donations/recent', {
        params: { limit, hours },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== Search donations by name/email/campaign =====
  searchDonations: async (query, page = 0, size = 20) => {
    try {
      const response = await api.get('/donations/search', {
        params: { query, page, size },
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching donations for query "${query}":`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== BULK OPERATIONS (client-side fallback if backend bulk not ready) =====

  /**
   * Refund multiple donations (uses individual calls if no bulk endpoint)
   * Note: You'll need to implement POST /api/donations/{id}/refund on backend
   */
  bulkRefundDonations: async (donationIds = [], reason = '') => {
    try {
      const promises = donationIds.map((id) =>
        api.post(`/donations/${id}/refund`, { reason })
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failureCount = results.filter((r) => r.status === 'rejected').length;

      return {
        totalProcessed: donationIds.length,
        successCount,
        failureCount,
        reason,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in bulk refund:', error);
      throw error;
    }
  },

  /**
   * Export donations as CSV (or other formats)
   */
  exportDonations: async (format = 'csv', filters = {}) => {
    try {
      const response = await api.get('/donations/export', {
        params: { format, ...filters },
        responseType: 'blob',
      });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donations_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting donations:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default donationService;
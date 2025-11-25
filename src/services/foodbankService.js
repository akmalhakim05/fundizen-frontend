// src/services/foodbankService.js
import api from './api';

/**
 * Food Bank Management Service
 * Covers all /api/foodbank/* endpoints for public & admin use
 */
const foodbankService = {

  /**
   * NEW: Unified Admin Food Bank Endpoint
   * GET /api/admin/foodbank
   */
  getAdminFoodBankPage: async ({
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDir = 'desc',
    status = 'all',
    search = ''
  } = {}) => {
    try {
      const response = await api.get('/admin/foodbank', {
        params: {
          page,
          size,
          sortBy,
          sortDir,
          status: status === 'all' ? undefined : status,
          search: search || undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin food bank page:', error);
      throw error.response?.data || { message: 'Failed to load food bank data' };
    }
  },

  // ==================== LIST & DISCOVER FOOD ====================

  /**
   * 39. Get Food Bank by ID
   * GET /api/foodbank/{id}
   */
  getFoodBankById: async (foodBankId) => {
    try {
      const response = await api.get(`/foodbank/${foodBankId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Food bank not found' };
    }
  },

  // ==================== ADMIN ACTIONS ====================

  /**
   * 40. Update Food Bank (Admin override)
   * PUT /api/foodbank/{id}?userId={adminUserId}
   */
  updateFoodBank: async (foodBankId, updates, adminUserId) => {
    try {
      const response = await api.put(`/foodbank/${foodBankId}`, updates, {
        params: { userId: adminUserId }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to update food bank' };
    }
  },

  /**
   * 41. Delete Food Bank (Admin only)
   * DELETE /api/foodbank/{id}?userId={adminUserId}
   */
  deleteFoodBank: async (foodBankId, adminUserId) => {
    try {
      const response = await api.delete(`/foodbank/${foodBankId}`, {
        params: { userId: adminUserId }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to delete food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to delete food bank' };
    }
  },

  /**
   * 42. Update Food Bank Status (available/taken/expired)
   * PUT /api/foodbank/{id}/status
   */
  updateFoodBankStatus: async (foodBankId, status) => {
    try {
      const response = await api.put(`/foodbank/${foodBankId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Failed to update status for food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to update status' };
    }
  },

  // ==================== USER-SPECIFIC ====================

  /**
   * 43. Get User's Food Banks
   * GET /api/foodbank/user/{userId}?page=0&size=20
   */
  getUserFoodBanks: async (userId, options = {}) => {
    try {
      const params = {
        page: options.page ?? 0,
        size: options.size ?? 20,
        sortBy: options.sortBy || 'createdAt',
        sortDir: options.sortDir || 'desc',
        ...options
      };

      const response = await api.get(`/foodbank/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch food banks for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to load user food banks' };
    }
  },

  // ==================== AVAILABILITY & SEARCH ====================

  /**
   * 44. Get Food Bank Availability Details
   * GET /api/foodbank/{id}/availability
   */
  getFoodBankAvailability: async (foodBankId) => {
    try {
      const response = await api.get(`/foodbank/${foodBankId}/availability`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch availability for food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to load availability' };
    }
  },

  /**
   * 45. Search Food Banks
   * GET /api/foodbank/search?q=rice
   */
  searchFoodBanks: async (query) => {
    try {
      const response = await api.get('/foodbank/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error);
      throw error.response?.data || { message: 'Search failed' };
    }
  },

  /**
   * 46. Find Food by Location Name
   * GET /api/foodbank/location?location=Petaling Jaya
   */
  findFoodByLocation: async (location) => {
    try {
      const response = await api.get('/foodbank/location', {
        params: { location }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to find food in location "${location}":`, error);
      throw error.response?.data || { message: 'Location search failed' };
    }
  },

  /**
   * 47. Find Nearby Food Banks
   * GET /api/foodbank/nearby?latitude=...&longitude=...&radiusKm=5.0
   */
  findNearbyFood: async (latitude, longitude, radiusKm = 5.0) => {
    try {
      const response = await api.get('/foodbank/nearby', {
        params: { latitude, longitude, radiusKm }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to find nearby food:', error);
      throw error.response?.data || { message: 'Nearby search failed' };
    }
  },

  /**
   * 48. Get Recent Food Posts
   * GET /api/foodbank/recent?days=7
   */
  getRecentFoodPosts: async (days = 7) => {
    try {
      const response = await api.get('/foodbank/recent', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent food posts:', error);
      throw error.response?.data || { message: 'Failed to load recent posts' };
    }
  },
};

export default foodbankService;
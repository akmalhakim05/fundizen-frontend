// src/services/pickupService.js
import api from './api';

/**
 * Food Pickup Management Service
 * Covers all /api/pickup/* endpoints for users and admins
 */
const pickupService = {

  /**
   * 49. Get Pickup by ID
   * GET /api/pickup/{id}
   */
  getPickupById: async (pickupId) => {
    try {
      const response = await api.get(`/pickup/${pickupId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pickup ${pickupId}:`, error);
      throw error.response?.data || { message: 'Pickup not found' };
    }
  },

  /**
   * 50. Get Pickup with Full Details (includes user + food bank info)
   * GET /api/pickup/{id}/details
   */
  getPickupWithDetails: async (pickupId) => {
    try {
      const response = await api.get(`/pickup/${pickupId}/details`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pickup details for ${pickupId}:`, error);
      throw error.response?.data || { message: 'Failed to load pickup details' };
    }
  },

  /**
   * 51. Get All Pickups for a Specific User (paginated)
   * GET /api/pickup/user/{userId}?page=0&size=20&sortBy=createdAt&sortDir=desc
   */
  getUserPickups: async (userId, options = {}) => {
    try {
      const params = {
        page: options.page ?? 0,
        size: options.size ?? 20,
        sortBy: options.sortBy || 'createdAt',
        sortDir: options.sortDir || 'desc',
        ...options
      };

      const response = await api.get(`/pickup/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pickups for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to load user pickups' };
    }
  },

  /**
   * 52. Get All Pickups for a Specific Food Bank
   * GET /api/pickup/foodbank/{foodBankId}
   */
  getFoodBankPickups: async (foodBankId) => {
    try {
      const response = await api.get(`/pickup/foodbank/${foodBankId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pickups for food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to load food bank pickups' };
    }
  },

  /**
   * 53. Get Active (Reserved) Pickups for a Food Bank
   * GET /api/pickup/foodbank/{foodBankId}/active
   */
  getActiveFoodBankPickups: async (foodBankId) => {
    try {
      const response = await api.get(`/pickup/foodbank/${foodBankId}/active`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch active pickups for food bank ${foodBankId}:`, error);
      throw error.response?.data || { message: 'Failed to load active pickups' };
    }
  },
};

export default pickupService;
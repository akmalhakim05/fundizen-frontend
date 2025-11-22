// src/services/userService.js
import api from './api';

/**
 * User Management & Lookup Service
 * Covers: Admin Panel User Management + Public User Lookup
 */
const userService = {

  // ==================== ADMIN USER MANAGEMENT ====================

  /**
   * Get all users with advanced filtering, sorting, search & pagination
   * GET /api/admin/users?page=0&size=20&role=user&verified=true&search=john
   */
  getAllUsersForAdmin: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users (admin):', error);
      throw error.response?.data || { message: 'Failed to load users' };
    }
  },

  /**
   * Get detailed user profile + campaigns + stats (Admin view)
   * GET /api/admin/users/{id}
   */
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch details for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to load user details' };
    }
  },

  /**
   * Promote user to admin
   * POST /api/admin/users/{id}/promote
   */
  promoteUserToAdmin: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/promote`);
      return response.data;
    } catch (error) {
      console.error(`Failed to promote user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to promote user' };
    }
  },

  /**
   * Demote admin to regular user
   * POST /api/admin/users/{id}/demote
   */
  demoteAdminToUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/demote`);
      return response.data;
    } catch (error) {
      console.error(`Failed to demote user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to demote user' };
    }
  },

  /**
   * Permanently delete a user account (admin only)
   * DELETE /api/admin/users/{id}
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },

  /**
   * Bulk promote/demote users (client-side fallback)
   */
  bulkUpdateUserRoles: async (userIds = [], newRole = 'user') => {
    try {
      const action = newRole === 'admin' ? userService.promoteUserToAdmin : userService.demoteAdminToUser;
      const promises = userIds.map(id => action(id));
      const results = await Promise.allSettled(promises);

      return {
        totalProcessed: userIds.length,
        successCount: results.filter(r => r.status === 'fulfilled').length,
        failureCount: results.filter(r => r.status === 'rejected').length,
        newRole,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Bulk role update failed:', error);
      throw error;
    }
  },

  // ==================== PUBLIC USER LOOKUP ====================

  /**
   * Get basic user info by ID (public endpoint)
   * GET /api/users/{id}
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw error.response?.data || { message: 'User not found' };
    }
  },

  /**
   * Get all users with a specific role (public/admin use)
   * GET /api/users/role/{role}
   */
  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch users with role ${role}:`, error);
      throw error.response?.data || { message: 'Failed to load users by role' };
    }
  },

  /**
   * Get platform user statistics (public dashboard)
   * GET /api/users/stats
   */
  getUserStatistics: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      return { totalUsers: 0, adminUsers: 0, timestamp: new Date().toISOString() };
    }
  },
};

export default userService;


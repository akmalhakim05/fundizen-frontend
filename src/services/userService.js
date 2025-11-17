// src/services/userService.js
import api from './api';

const userService = {
  // ===== ADMIN USER MANAGEMENT =====

  /**
   * Get all users with pagination, filters, sorting and search (Admin Panel)
   * GET /api/admin/users?page=0&size=20&sortBy=createdAt&sortDir=desc&role=user&verified=true&search=john
   */
  getAllUsersForAdmin: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching users for admin:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get detailed information of a specific user (including campaigns & stats)
   * GET /api/admin/users/{id}
   */
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Promote a user to admin role
   * POST /api/admin/users/{id}/promote
   */
  promoteUserToAdmin: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/promote`);
      return response.data;
    } catch (error) {
      console.error(`Error promoting user ${userId} to admin:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Demote an admin back to regular user
   * POST /api/admin/users/{id}/demote
   */
  demoteAdminToUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/demote`);
      return response.data;
    } catch (error) {
      console.error(`Error demoting user ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Permanently delete a user account
   * DELETE /api/admin/users/{id}
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== BULK OPERATIONS (client-side fallback if backend bulk endpoints are missing) =====

  /**
   * Bulk promote/demote users (uses individual calls if no bulk endpoint)
   */
  bulkUpdateUserRoles: async (userIds = [], newRole = 'user') => {
    try {
      const promises = userIds.map((userId) =>
        newRole === 'admin'
          ? userService.promoteUserToAdmin(userId)
          : userService.demoteAdminToUser(userId)
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failureCount = results.filter((r) => r.status === 'rejected').length;

      return {
        totalProcessed: userIds.length,
        successCount,
        failureCount,
        newRole,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in bulk role update:', error);
      throw error;
    }
  },
};

export default userService;
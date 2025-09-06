import api from './api';

export const adminService = {
  // ===== DASHBOARD ENDPOINTS =====
  
  // Get admin dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== CAMPAIGN MANAGEMENT =====

  // Get all campaigns for admin review (with pagination and filters)
  getAllCampaignsForAdmin: async (params = {}) => {
    try {
      const response = await api.get('/admin/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns for admin:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get pending campaigns for approval
  getPendingCampaigns: async () => {
    try {
      const response = await api.get('/admin/campaigns/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // Approve a campaign
  approveCampaign: async (campaignId, reason = '') => {
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/approve`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error approving campaign ${campaignId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Reject a campaign
  rejectCampaign: async (campaignId, reason = '') => {
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting campaign ${campaignId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Bulk approve multiple campaigns
  bulkApproveCampaigns: async (campaignIds) => {
    try {
      const response = await api.post('/admin/campaigns/bulk-approve', { campaignIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // Bulk reject multiple campaigns
  bulkRejectCampaigns: async (campaignIds, reason = '') => {
    try {
      const response = await api.post('/admin/campaigns/bulk-reject', { 
        campaignIds, 
        reason 
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk rejecting campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== USER MANAGEMENT =====

  // Get all users for admin management (with pagination and filters)
  getAllUsersForAdmin: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users for admin:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get user details by ID
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Promote user to admin
  promoteUserToAdmin: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/promote`);
      return response.data;
    } catch (error) {
      console.error(`Error promoting user ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Demote admin to regular user
  demoteAdminToUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/demote`);
      return response.data;
    } catch (error) {
      console.error(`Error demoting user ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Bulk update user roles
  bulkUpdateUserRoles: async (userIds, newRole) => {
    try {
      const response = await api.post('/admin/users/bulk-role-update', { 
        userIds, 
        newRole 
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      throw error.response?.data || error.message;
    }
  },

  // Bulk update user verification status
  bulkUpdateUserVerification: async (userIds, verified) => {
    try {
      const response = await api.post('/admin/users/bulk-verification-update', { 
        userIds, 
        verified 
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating user verification:', error);
      throw error.response?.data || error.message;
    }
  },

  // Advanced user search
  searchUsersAdvanced: async (searchParams) => {
    try {
      const response = await api.get('/admin/users/search-advanced', { 
        params: searchParams 
      });
      return response.data;
    } catch (error) {
      console.error('Error in advanced user search:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== SYSTEM MANAGEMENT =====

  // Get system statistics
  getSystemStatistics: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get system health metrics
  getSystemHealth: async () => {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error.response?.data || error.message;
    }
  },

  // Perform system cleanup and maintenance
  performSystemCleanup: async () => {
    try {
      const response = await api.post('/admin/system/cleanup');
      return response.data;
    } catch (error) {
      console.error('Error performing system cleanup:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== ANALYTICS AND REPORTS =====

  // Get campaign analytics
  getCampaignAnalytics: async (timeRange = 'month') => {
    try {
      const response = await api.get('/admin/analytics/campaigns', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get user analytics
  getUserAnalytics: async (timeRange = 'month') => {
    try {
      const response = await api.get('/admin/analytics/users', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Export data for reports
  exportData: async (dataType, format = 'csv') => {
    try {
      const response = await api.get(`/admin/export/${dataType}`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error(`Error exporting ${dataType} data:`, error);
      throw error.response?.data || error.message;
    }
  },

  // ===== NOTIFICATIONS AND ALERTS =====

  // Get admin notifications
  getAdminNotifications: async () => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Send system-wide announcement
  sendAnnouncement: async (announcement) => {
    try {
      const response = await api.post('/admin/announcements', announcement);
      return response.data;
    } catch (error) {
      console.error('Error sending announcement:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== CONFIGURATION MANAGEMENT =====

  // Get system configuration
  getSystemConfig: async () => {
    try {
      const response = await api.get('/admin/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching system config:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update system configuration
  updateSystemConfig: async (config) => {
    try {
      const response = await api.put('/admin/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating system config:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== AUDIT AND LOGGING =====

  // Get audit logs
  getAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get system logs
  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/system-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw error.response?.data || error.message;
    }
  }
};
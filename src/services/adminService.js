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

  // ===== USER MANAGEMENT ENDPOINTS =====

  // Get all users with pagination and filters (admin panel)
  getAllUsersForAdmin: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching users for admin:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get basic user list (public endpoint)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const response = await api.get('/users/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get user details by ID
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Get basic user info
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
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

  // Demote admin to user
  demoteAdminToUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/demote`);
      return response.data;
    } catch (error) {
      console.error(`Error demoting user ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete user (if this endpoint exists in your backend)
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
      // Since your backend doesn't have bulk endpoints yet, 
      // we'll simulate it by calling individual promote/demote endpoints
      const promises = userIds.map(userId => {
        if (newRole === 'admin') {
          return adminService.promoteUserToAdmin(userId);
        } else {
          return adminService.demoteAdminToUser(userId);
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      return {
        totalProcessed: userIds.length,
        successCount,
        failureCount,
        newRole,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      throw error.response?.data || error.message;
    }
  },

  // Bulk update user verification status
  bulkUpdateUserVerification: async (userIds, verified) => {
    try {
      // Since your backend doesn't have bulk verification endpoints yet,
      // we'll simulate this functionality. You'll need to implement these endpoints
      // in your backend: PUT /admin/users/{id}/verify and PUT /admin/users/{id}/unverify
      const endpoint = verified ? 'verify' : 'unverify';
      
      const promises = userIds.map(userId =>
        api.put(`/admin/users/${userId}/${endpoint}`)
      );
      
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      return {
        totalProcessed: userIds.length,
        successCount,
        failureCount,
        verified,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error bulk updating user verification:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get user statistics
  getUserStatistics: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get recent users
  getRecentUsers: async (days = 30) => {
    try {
      const response = await api.get('/users/recent', { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent users:', error);
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
      
      // Debug log
      console.log('API Response:', response.data);
      
      // Ensure campaigns array is properly returned
      const campaigns = response.data.campaigns || response.data || [];
      
      // Map MongoDB _id to id if needed
      const mappedCampaigns = campaigns.map(campaign => ({
        ...campaign,
        id: campaign.id || campaign._id?.$oid || campaign._id,
        // Ensure documentUrl is properly mapped
        documentUrl: campaign.documentUrl || campaign.DocumentUrl || null
      }));
      
      console.log('Mapped Campaigns:', mappedCampaigns);
      
      return {
        campaigns: mappedCampaigns,
        count: mappedCampaigns.length
      };
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
      const results = await Promise.allSettled(
        campaignIds.map(id => adminService.approveCampaign(id))
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      return {
        totalProcessed: campaignIds.length,
        successCount,
        failureCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error bulk approving campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // Bulk reject multiple campaigns
  bulkRejectCampaigns: async (campaignIds, reason = '') => {
    try {
      const results = await Promise.allSettled(
        campaignIds.map(id => adminService.rejectCampaign(id, reason))
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      return {
        totalProcessed: campaignIds.length,
        successCount,
        failureCount,
        reason,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error bulk rejecting campaigns:', error);
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
// src/services/campaignService.js
import api from './api';

/**
 * Campaign Management Service (Admin Panel)
 * All endpoints require admin privileges
 */
const campaignService = {

  // ==================== FETCH CAMPAIGNS ====================

  /**
   * Get all campaigns with advanced filtering, sorting & pagination
   * GET /api/admin/campaigns?page=0&size=20&status=pending&category=Medical&sortBy=createdAt&sortDir=desc
   */
  getAllCampaigns: async (filters = {}) => {
    try {
      const response = await api.get('/admin/campaigns', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw error.response?.data || { message: 'Failed to load campaigns' };
    }
  },

  /**
   * Get only pending campaigns (for approval queue)
   * GET /api/admin/campaigns/pending
   */
  getPendingCampaigns: async () => {
    try {
      const response = await api.get('/admin/campaigns/pending');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending campaigns:', error);
      throw error.response?.data || { message: 'Failed to load pending campaigns' };
    }
  },

  /**
   * Get campaigns created by a specific user (Admin view)
   * GET /api/campaigns/user/{userId}?status=all
   */
  getUserCampaigns: async (userId, status = 'all') => {
    try {
      const response = await api.get(`/campaigns/user/${userId}`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch campaigns for user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to load user campaigns' };
    }
  },

  // ==================== CAMPAIGN ACTIONS ====================

  /**
   * Approve a pending campaign
   * POST /api/admin/campaigns/{id}/approve
   */
  approveCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/approve`);
      return response.data;
    } catch (error) {
      console.error(`Failed to approve campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to approve campaign' };
    }
  },

  /**
   * Reject a pending campaign with reason
   * POST /api/admin/campaigns/{id}/reject
   */
  rejectCampaign: async (campaignId, reason) => {
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Failed to reject campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to reject campaign' };
    }
  },

  /**
   * Update any campaign (admin override)
   * PUT /api/campaigns/{id}
   */
  updateCampaign: async (campaignId, updates) => {
    try {
      const response = await api.put(`/campaigns/${campaignId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to update campaign' };
    }
  },

  /**
   * Permanently delete a campaign
   * DELETE /api/campaigns/{id}
   */
  deleteCampaign: async (campaignId) => {
    try {
      const response = await api.delete(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete campaign ${campaignId}:`, error);
      throw error.response?.data || { message: 'Failed to delete campaign' };
    }
  },

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk approve multiple campaigns
   * POST /api/admin/campaigns/bulk/approve
   */
  bulkApproveCampaigns: async (campaignIds = []) => {
    try {
      const response = await api.post('/admin/campaigns/bulk/approve', { campaignIds });
      return response.data;
    } catch (error) {
      console.error('Bulk approve failed:', error);
      throw error.response?.data || { message: 'Bulk approve failed' };
    }
  },

  /**
   * Bulk reject multiple campaigns
   * POST /api/admin/campaigns/bulk/reject
   */
  bulkRejectCampaigns: async (campaignIds = [], reason = '') => {
    try {
      const response = await api.post('/admin/campaigns/bulk/reject', { campaignIds, reason });
      return response.data;
    } catch (error) {
      console.error('Bulk reject failed:', error);
      throw error.response?.data || { message: 'Bulk reject failed' };
    }
  },

  // ==================== COMMENTS & MODERATION ====================

  /**
   * Delete any comment from any campaign (admin only)
   * DELETE /api/campaigns/comments/{campaignId}/{commentId}?userId={adminId}
   */
  deleteCampaignComment: async (campaignId, commentId, adminUserId) => {
    try {
      const response = await api.delete(`/campaigns/comments/${campaignId}/${commentId}`, {
        params: { userId: adminUserId }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error.response?.data || { message: 'Failed to delete comment' };
    }
  },

  // ==================== EXPORT ====================

  /**
   * Export campaigns as CSV (admin only)
   * GET /api/admin/campaigns/export/csv
   */
  exportCampaignsAsCSV: async () => {
    try {
      const response = await api.get('/admin/campaigns/export/csv', {
        responseType: 'blob'
      });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fundizen_campaigns_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error.response?.data || { message: 'Export failed' };
    }
  }
};

export default campaignService;

// Admin Campaign Features
// Get All Campaigns (filtered)       -> GET /admin/campaigns
// Get Pending Campaigns               -> GET /admin/campaigns/pending
// Approve Campaign                    -> POST /admin/campaigns/{id}/approve
// Reject Campaign                     -> POST /admin/campaigns/{id}/reject
// Update Campaign                     -> PUT /campaigns/{id}
// Delete Campaign                     -> DELETE /campaigns/{id}
// Bulk Approve/Reject                 -> /bulk/approve, /bulk/reject
// Get User’s Campaigns                -> GET /campaigns/user/{id}
// Delete Comment (moderation)         -> DELETE /campaigns/comments/...
// Export to CSV                       -> GET /admin/campaigns/export/csv
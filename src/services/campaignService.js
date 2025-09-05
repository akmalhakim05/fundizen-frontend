import api from './api';

export const campaignService = {
  // Get all public campaigns
  getPublicCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      console.error('Error fetching public campaigns:', error);
      throw error.response?.data || { error: 'Failed to fetch campaigns' };
    }
  },

  // Get active campaigns only
  getActiveCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      throw error.response?.data || { error: 'Failed to fetch active campaigns' };
    }
  },

  // Get pending campaigns (for admin)
  getPendingCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending campaigns:', error);
      throw error.response?.data || { error: 'Failed to fetch pending campaigns' };
    }
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign by ID:', error);
      throw error.response?.data || { error: 'Failed to fetch campaign' };
    }
  },

  // Get campaigns by category
  getCampaignsByCategory: async (category) => {
    try {
      const response = await api.get(`/campaigns/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns by category:', error);
      throw error.response?.data || { error: 'Failed to fetch campaigns by category' };
    }
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    try {
      console.log('Creating campaign with data:', campaignData);
      const response = await api.post('/campaigns/create', campaignData);
      console.log('Campaign creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle different types of errors
      if (error.response?.data) {
        // Server responded with error data
        throw error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        throw { error: 'Network error - please check your connection' };
      } else {
        // Something else happened
        throw { error: 'Failed to create campaign: ' + error.message };
      }
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error.response?.data || { error: 'Failed to update campaign' };
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error.response?.data || { error: 'Failed to delete campaign' };
    }
  },

  // Verify campaign (admin only)
  verifyCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/campaigns/verify/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying campaign:', error);
      throw error.response?.data || { error: 'Failed to verify campaign' };
    }
  },

  // Reject campaign (admin only)
  rejectCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/campaigns/reject/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      throw error.response?.data || { error: 'Failed to reject campaign' };
    }
  }
};
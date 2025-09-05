import api from './api';

export const campaignService = {
  // Get all public campaigns
  getPublicCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      console.error('Error fetching public campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get active campaigns only
  getActiveCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get pending campaigns (for admin)
  getPendingCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending campaigns:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Get campaigns by category
  getCampaignsByCategory: async (category) => {
    try {
      const response = await api.get(`/campaigns/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns for category ${category}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new campaign - IMPROVED ERROR HANDLING
  createCampaign: async (campaignData) => {
    try {
      console.log('CampaignService: Creating campaign with data:', campaignData);
      
      // Validate data before sending
      if (!campaignData.name || !campaignData.category || !campaignData.description) {
        throw new Error('Missing required fields: name, category, or description');
      }

      if (!campaignData.goalAmount || campaignData.goalAmount <= 0) {
        throw new Error('Goal amount must be greater than 0');
      }

      if (!campaignData.startDate || !campaignData.endDate) {
        throw new Error('Start date and end date are required');
      }

      // Clean the data - remove empty strings and convert to null
      const cleanedData = {
        ...campaignData,
        imageUrl: campaignData.imageUrl && campaignData.imageUrl.trim() ? campaignData.imageUrl.trim() : null,
        documentUrl: campaignData.documentUrl && campaignData.documentUrl.trim() ? campaignData.documentUrl.trim() : null,
        name: campaignData.name.trim(),
        description: campaignData.description.trim()
      };

      console.log('CampaignService: Sending cleaned data:', cleanedData);
      
      const response = await api.post('/campaigns/create', cleanedData);
      
      console.log('CampaignService: Campaign created successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('CampaignService: Error creating campaign:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('API Response Error:', {
          message: error.message,
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.response.config?.url,
          data: error.response.data,
          headers: error.response.headers
        });
        
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        // Return the server error response
        throw error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network Error: No response received:', error.request);
        throw { error: 'Network error. Please check your connection and try again.' };
      } else {
        // Something else happened
        console.error('Request Error:', error.message);
        throw { error: error.message || 'An unexpected error occurred' };
      }
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      console.log(`CampaignService: Updating campaign ${id} with data:`, campaignData);
      
      const response = await api.put(`/campaigns/${id}`, campaignData);
      
      console.log('CampaignService: Campaign updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`CampaignService: Error updating campaign ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    try {
      console.log(`CampaignService: Deleting campaign ${id}`);
      
      const response = await api.delete(`/campaigns/${id}`);
      
      console.log('CampaignService: Campaign deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`CampaignService: Error deleting campaign ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Verify campaign (admin only)
  verifyCampaign: async (campaignId) => {
    try {
      console.log(`CampaignService: Verifying campaign ${campaignId}`);
      
      const response = await api.post(`/campaigns/verify/${campaignId}`);
      
      console.log('CampaignService: Campaign verified successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`CampaignService: Error verifying campaign ${campaignId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Reject campaign (admin only)
  rejectCampaign: async (campaignId) => {
    try {
      console.log(`CampaignService: Rejecting campaign ${campaignId}`);
      
      const response = await api.post(`/campaigns/reject/${campaignId}`);
      
      console.log('CampaignService: Campaign rejected successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`CampaignService: Error rejecting campaign ${campaignId}:`, error);
      throw error.response?.data || error.message;
    }
  }
};
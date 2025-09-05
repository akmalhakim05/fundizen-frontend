import api from './api';

export const uploadService = {
  // Upload campaign image
  uploadCampaignImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/campaign/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file upload
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Upload failed' };
    }
  },

  // Upload campaign document
  uploadCampaignDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/campaign/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Upload failed' };
    }
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Upload failed' };
    }
  },

  // Generic upload (backward compatibility)
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Upload failed' };
    }
  },

  // Delete uploaded file
  deleteFile: async (cloudinaryUrl) => {
    try {
      const response = await api.delete('/upload', {
        params: { url: cloudinaryUrl }
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Delete failed' };
    }
  }
};
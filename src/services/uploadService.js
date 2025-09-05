import api from './api';
import { optimizationCache } from '../utils/OptimizationCache';

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
  },

  // Get optimized image URL - WITH CACHING
  getOptimizedImageUrl: async (originalUrl, width = 800, height = 600, crop = 'fill') => {
    try {
      // Use cache to prevent duplicate requests
      return await optimizationCache.getOptimizedUrl(
        originalUrl, 
        width, 
        height, 
        crop,
        // The actual optimization function
        async (url, w, h, c) => {
          console.log(`Making optimization API call for: ${url} (${w}x${h}, ${c})`);
          
          const response = await api.get('/upload/optimize', {
            params: { url, width: w, height: h, crop: c },
            timeout: 10000 // 10 second timeout for optimization
          });

          return response.data.optimizedUrl || url;
        }
      );
    } catch (error) {
      console.error('Optimization failed, using original URL:', error);
      // Return original URL if optimization fails
      return originalUrl;
    }
  },

  // Utility function to clear optimization cache
  clearOptimizationCache: () => {
    optimizationCache.clear();
  },

  // Get cache statistics
  getCacheStats: () => {
    return optimizationCache.getStats();
  }
};
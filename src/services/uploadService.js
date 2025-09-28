import api from './api';

export const uploadService = {
  // ===== DOCUMENT UPLOAD ENDPOINTS =====
  
  /**
   * Upload a document with file validation and security checks
   * @param {File} file - The file to upload
   * @param {string} campaignId - Associated campaign ID
   * @param {string} documentType - Type of document (verification, legal, financial, etc.)
   * @param {Object} metadata - Additional metadata
   */
  uploadDocument: async (file, campaignId, documentType = 'verification', metadata = {}) => {
    try {
      // Validate file before upload
      const validationResult = uploadService.validateFile(file);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);
      formData.append('documentType', documentType);
      formData.append('metadata', JSON.stringify({
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        ...metadata
      }));

      const response = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Upload multiple documents at once
   * @param {FileList} files - Files to upload
   * @param {string} campaignId - Associated campaign ID
   * @param {string} documentType - Type of documents
   */
  uploadMultipleDocuments: async (files, campaignId, documentType = 'verification') => {
    try {
      const uploadPromises = Array.from(files).map(file =>
        uploadService.uploadDocument(file, campaignId, documentType)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);

      return {
        successful,
        failed,
        totalUploaded: successful.length,
        totalFailed: failed.length
      };
    } catch (error) {
      console.error('Error uploading multiple documents:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   */
  validateFile: (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 50MB limit'
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed. Please upload PDF, DOC, DOCX, JPG, PNG, or TXT files only.'
      };
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: 'File extension not allowed'
      };
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /script/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.com$/i,
      /\.scr$/i,
      /\.vbs$/i,
      /\.js$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return {
        isValid: false,
        error: 'File name contains potentially dangerous content'
      };
    }

    return {
      isValid: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: extension
      }
    };
  },

  // ===== ADMIN DOCUMENT MANAGEMENT =====

  /**
   * Get all documents for admin review
   * @param {Object} filters - Filtering options
   */
  getDocumentsForReview: async (filters = {}) => {
    try {
      const response = await api.get('/admin/documents', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching documents for review:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get document details by ID
   * @param {string} documentId - Document ID
   */
  getDocumentDetails: async (documentId) => {
    try {
      const response = await api.get(`/admin/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document details:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get documents for a specific campaign
   * @param {string} campaignId - Campaign ID
   */
  getCampaignDocuments: async (campaignId) => {
    try {
      const response = await api.get(`/admin/campaigns/${campaignId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign documents:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Approve a document
   * @param {string} documentId - Document ID
   * @param {string} adminNotes - Admin approval notes
   */
  approveDocument: async (documentId, adminNotes = '') => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/approve`, {
        adminNotes,
        approvedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error approving document:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reject a document
   * @param {string} documentId - Document ID
   * @param {string} reason - Rejection reason
   * @param {string} adminNotes - Admin rejection notes
   */
  rejectDocument: async (documentId, reason, adminNotes = '') => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/reject`, {
        reason,
        adminNotes,
        rejectedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting document:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Request additional documents from campaign creator
   * @param {string} campaignId - Campaign ID
   * @param {string} documentType - Type of document requested
   * @param {string} message - Message to campaign creator
   */
  requestAdditionalDocuments: async (campaignId, documentType, message) => {
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/request-documents`, {
        documentType,
        message,
        requestedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting additional documents:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Flag a document for further review
   * @param {string} documentId - Document ID
   * @param {string} flagReason - Reason for flagging
   * @param {string} priority - Priority level (low, medium, high, urgent)
   */
  flagDocument: async (documentId, flagReason, priority = 'medium') => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/flag`, {
        flagReason,
        priority,
        flaggedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error flagging document:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== ADMIN NOTES AND ANNOTATIONS =====

  /**
   * Save admin notes for a document
   * @param {string} documentId - Document ID
   * @param {string} notes - Admin notes
   * @param {string} status - Review status
   */
  saveAdminNotes: async (documentId, notes, status = 'in_review') => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/notes`, {
        notes,
        status,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error saving admin notes:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get admin notes for a document
   * @param {string} documentId - Document ID
   */
  getAdminNotes: async (documentId) => {
    try {
      const response = await api.get(`/admin/documents/${documentId}/notes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin notes:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Add annotation to a document
   * @param {string} documentId - Document ID
   * @param {Object} annotation - Annotation data
   */
  addAnnotation: async (documentId, annotation) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/annotations`, {
        ...annotation,
        createdAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get annotations for a document
   * @param {string} documentId - Document ID
   */
  getAnnotations: async (documentId) => {
    try {
      const response = await api.get(`/admin/documents/${documentId}/annotations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== REVIEW HISTORY AND AUDIT TRAIL =====

  /**
   * Get review history for a document or campaign
   * @param {string} id - Document or Campaign ID
   * @param {string} type - 'document' or 'campaign'
   */
  getReviewHistory: async (id, type = 'document') => {
    try {
      const endpoint = type === 'campaign' 
        ? `/admin/campaigns/${id}/review-history`
        : `/admin/documents/${id}/review-history`;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching review history:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Log admin action for audit trail
   * @param {string} documentId - Document ID
   * @param {string} action - Action performed
   * @param {string} details - Action details
   * @param {Object} metadata - Additional metadata
   */
  logAdminAction: async (documentId, action, details, metadata = {}) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/actions`, {
        action,
        details,
        metadata,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error logging admin action:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get audit trail for a document
   * @param {string} documentId - Document ID
   */
  getAuditTrail: async (documentId) => {
    try {
      const response = await api.get(`/admin/documents/${documentId}/audit-trail`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== DOCUMENT SECURITY AND INTEGRITY =====

  /**
   * Verify document integrity
   * @param {string} documentId - Document ID
   */
  verifyDocumentIntegrity: async (documentId) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/verify-integrity`);
      return response.data;
    } catch (error) {
      console.error('Error verifying document integrity:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Scan document for security threats
   * @param {string} documentId - Document ID
   */
  scanDocumentSecurity: async (documentId) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/security-scan`);
      return response.data;
    } catch (error) {
      console.error('Error scanning document security:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Generate document thumbnail
   * @param {string} documentId - Document ID
   */
  generateThumbnail: async (documentId) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/thumbnail`);
      return response.data;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== BULK OPERATIONS =====

  /**
   * Bulk approve documents
   * @param {Array} documentIds - Array of document IDs
   * @param {string} adminNotes - Bulk approval notes
   */
  bulkApproveDocuments: async (documentIds, adminNotes = '') => {
    try {
      const response = await api.post('/admin/documents/bulk-approve', {
        documentIds,
        adminNotes,
        approvedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving documents:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Bulk reject documents
   * @param {Array} documentIds - Array of document IDs
   * @param {string} reason - Rejection reason
   * @param {string} adminNotes - Bulk rejection notes
   */
  bulkRejectDocuments: async (documentIds, reason, adminNotes = '') => {
    try {
      const response = await api.post('/admin/documents/bulk-reject', {
        documentIds,
        reason,
        adminNotes,
        rejectedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk rejecting documents:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Bulk flag documents
   * @param {Array} documentIds - Array of document IDs
   * @param {string} flagReason - Flag reason
   * @param {string} priority - Priority level
   */
  bulkFlagDocuments: async (documentIds, flagReason, priority = 'medium') => {
    try {
      const response = await api.post('/admin/documents/bulk-flag', {
        documentIds,
        flagReason,
        priority,
        flaggedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk flagging documents:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== DOCUMENT ANALYTICS AND REPORTS =====

  /**
   * Get document review statistics
   * @param {Object} filters - Date range and other filters
   */
  getDocumentStatistics: async (filters = {}) => {
    try {
      const response = await api.get('/admin/documents/statistics', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching document statistics:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get pending review queue metrics
   */
  getReviewQueueMetrics: async () => {
    try {
      const response = await api.get('/admin/documents/queue-metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching queue metrics:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Generate document review report
   * @param {Object} reportParams - Report parameters
   */
  generateReviewReport: async (reportParams) => {
    try {
      const response = await api.post('/admin/documents/generate-report', reportParams, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_review_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error generating review report:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== DOCUMENT TEMPLATES AND STANDARDS =====

  /**
   * Get document requirements for campaign types
   * @param {string} campaignType - Type of campaign
   */
  getDocumentRequirements: async (campaignType) => {
    try {
      const response = await api.get(`/admin/document-requirements/${campaignType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document requirements:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update document requirements
   * @param {string} campaignType - Type of campaign
   * @param {Object} requirements - Document requirements
   */
  updateDocumentRequirements: async (campaignType, requirements) => {
    try {
      const response = await api.put(`/admin/document-requirements/${campaignType}`, requirements);
      return response.data;
    } catch (error) {
      console.error('Error updating document requirements:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get document templates
   */
  getDocumentTemplates: async () => {
    try {
      const response = await api.get('/admin/document-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching document templates:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== ADVANCED DOCUMENT PROCESSING =====

  /**
   * Extract text from document for analysis
   * @param {string} documentId - Document ID
   */
  extractDocumentText: async (documentId) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/extract-text`);
      return response.data;
    } catch (error) {
      console.error('Error extracting document text:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Analyze document content for compliance
   * @param {string} documentId - Document ID
   * @param {Array} complianceRules - Rules to check against
   */
  analyzeDocumentCompliance: async (documentId, complianceRules = []) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/analyze-compliance`, {
        complianceRules
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing document compliance:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Compare documents for similarity/fraud detection
   * @param {string} documentId1 - First document ID
   * @param {string} documentId2 - Second document ID
   */
  compareDocuments: async (documentId1, documentId2) => {
    try {
      const response = await api.post('/admin/documents/compare', {
        documentId1,
        documentId2
      });
      return response.data;
    } catch (error) {
      console.error('Error comparing documents:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== UTILITY FUNCTIONS =====

  /**
   * Convert file size to human readable format
   * @param {number} bytes - File size in bytes
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get file type icon
   * @param {string} extension - File extension
   */
  getFileTypeIcon: (extension) => {
    const icons = {
      '.pdf': '📕',
      '.doc': '📘',
      '.docx': '📘',
      '.txt': '📄',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.png': '🖼️',
      '.gif': '🖼️'
    };
    return icons[extension?.toLowerCase()] || '📄';
  },

  /**
   * Validate document URL
   * @param {string} url - Document URL
   */
  validateDocumentUrl: (url) => {
    try {
      const urlObj = new URL(url);
      const allowedDomains = ['cloudinary.com', 'amazonaws.com', 'your-domain.com'];
      return allowedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  },

  /**
   * Generate secure document access token
   * @param {string} documentId - Document ID
   * @param {number} expiresIn - Token expiration time in seconds
   */
  generateAccessToken: async (documentId, expiresIn = 3600) => {
    try {
      const response = await api.post(`/admin/documents/${documentId}/access-token`, {
        expiresIn
      });
      return response.data;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default uploadService;
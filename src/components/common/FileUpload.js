import React, { useState } from 'react';
import { uploadService } from '../../services/uploadService';
import './FileUpload.css';

const FileUpload = ({ 
  type = 'image', // 'image', 'document', 'profile', 'generic'
  onUploadSuccess, 
  onUploadError,
  accept,
  maxSize = 10 * 1024 * 1024, // Updated to 10MB to match backend
  placeholder = "Choose file..."
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Default accept types based on upload type
  const getAcceptTypes = () => {
    if (accept) return accept;
    
    switch (type) {
      case 'image':
      case 'profile':
        return '.jpg,.jpeg,.png,.gif,.webp';
      case 'document':
        return '.pdf,.doc,.docx';
      default:
        return '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx';
    }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      throw new Error(`File size must be less than ${maxSizeMB}MB. Current size: ${formatFileSize(file.size)}`);
    }

    // Check file type
    const allowedTypes = getAcceptTypes().split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Client-side validation first
      validateFile(file);

      console.log('Uploading file:', {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });

      let uploadResponse;
      
      switch (type) {
        case 'image':
          uploadResponse = await uploadService.uploadCampaignImage(file);
          break;
        case 'document':
          uploadResponse = await uploadService.uploadCampaignDocument(file);
          break;
        case 'profile':
          uploadResponse = await uploadService.uploadProfileImage(file);
          break;
        default:
          uploadResponse = await uploadService.uploadFile(file);
      }

      setUploadProgress(100);
      
      console.log('Upload successful:', uploadResponse);
      
      if (onUploadSuccess) {
        onUploadSuccess(uploadResponse.url, uploadResponse);
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Upload failed';
      
      // Handle different error types
      if (error.response) {
        // HTTP response error
        const responseData = error.response.data;
        
        if (responseData.errorCode === 'FILE_SIZE_EXCEEDED') {
          errorMessage = `File too large! Maximum size allowed is ${responseData.maxSize}. Please choose a smaller file.`;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadTypeLabel = () => {
    switch (type) {
      case 'image':
        return 'Campaign Image';
      case 'document':
        return 'Document';
      case 'profile':
        return 'Profile Image';
      default:
        return 'File';
    }
  };

  const getMaxSizeForType = () => {
    // All types now support 10MB
    return formatFileSize(maxSize);
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      >
        <input
          type="file"
          id="file-input"
          className="file-input"
          onChange={handleFileSelect}
          accept={getAcceptTypes()}
          disabled={uploading}
        />
        
        <label htmlFor="file-input" className="file-upload-label">
          {uploading ? (
            <div className="upload-progress">
              <div className="upload-spinner"></div>
              <span>Uploading {getUploadTypeLabel()}...</span>
              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">
                {type === 'image' || type === 'profile' ? '🖼️' : '📄'}
              </div>
              <div className="upload-text">
                <strong>Drop {getUploadTypeLabel().toLowerCase()} here</strong>
                <span>or click to browse</span>
              </div>
              <div className="upload-info">
                <small>
                  Accepted: {getAcceptTypes().replace(/\./g, '').toUpperCase()} • 
                  Max size: {getMaxSizeForType()}
                </small>
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default FileUpload;
// src/components/campaigns/CreateCampaign.js - Fixed validation and submission
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FileUpload from '../common/FileUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import { campaignService } from '../../services/campaignService';
import '../../styles/components/CreateCampaign.css';

const CreateCampaign = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    documentUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const categories = [
    'Healthcare', 'Education', 'Technology', 'Environment', 
    'Community', 'Arts & Culture', 'Sports', 'Emergency'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleImageUpload = (url, response) => {
    setFormData({ ...formData, imageUrl: url });
    setUploadedImage({ url, response });
    setError('');
  };

  const handleImageUploadError = (errorMessage) => {
    setError(`Image upload failed: ${errorMessage}`);
  };

  const handleDocumentUpload = (url, response) => {
    setFormData({ ...formData, documentUrl: url });
    setUploadedDocument({ url, response });
    setError('');
  };

  const handleDocumentUploadError = (errorMessage) => {
    setError(`Document upload failed: ${errorMessage}`);
  };

  const validateForm = () => {
    // Reset error
    setError('');

    // Required field validation
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return false;
    }

    if (formData.name.trim().length < 3 || formData.name.trim().length > 100) {
      setError('Campaign name must be between 3 and 100 characters');
      return false;
    }

    if (!formData.category) {
      setError('Please select a category');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Campaign description is required');
      return false;
    }

    // Fix: Check description length (backend validation expects 10-2000 characters)
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }

    if (formData.description.trim().length > 2000) {
      setError('Description must not exceed 2000 characters');
      return false;
    }

    if (!formData.goalAmount || formData.goalAmount <= 0) {
      setError('Please enter a valid goal amount');
      return false;
    }

    const goalAmount = parseFloat(formData.goalAmount);
    if (goalAmount < 1 || goalAmount > 1000000) {
      setError('Goal amount must be between RM 1.00 and RM 1,000,000');
      return false;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }

    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }

    const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (daysDifference < 7) {
      setError('Campaign must run for at least 7 days');
      return false;
    }

    if (daysDifference > 365) {
      setError('Campaign cannot run for more than 365 days');
      return false;
    }

    // Fix: Validate document URL if provided
    if (formData.documentUrl && formData.documentUrl.trim()) {
      const docUrlPattern = /^https?:\/\/.*\.(pdf|doc|docx)$/i;
      if (!docUrlPattern.test(formData.documentUrl.trim())) {
        setError('Document URL must be a valid HTTP/HTTPS URL ending with pdf, doc, or docx');
        return false;
      }
    }

    // Fix: Validate image URL if provided
    if (formData.imageUrl && formData.imageUrl.trim()) {
      const imgUrlPattern = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i;
      if (!imgUrlPattern.test(formData.imageUrl.trim())) {
        setError('Image URL must be a valid HTTP/HTTPS URL ending with jpg, jpeg, png, gif, or webp');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);

    if (!validateForm()) {
      console.log('Validation failed:', error);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean and prepare data for submission
      const campaignData = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        goalAmount: parseFloat(formData.goalAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        // Fix: Only include URLs if they are not empty strings
        imageUrl: formData.imageUrl.trim() || null,
        documentUrl: formData.documentUrl.trim() || null,
        creatorId: currentUser?.id || 'temp-user-id' // Fallback for missing user ID
      };

      console.log('Sending campaign data:', campaignData);

      const response = await campaignService.createCampaign(campaignData);
      
      console.log('Campaign created successfully:', response);
      
      setSuccess('Campaign created successfully! It will be reviewed by our team.');
      
      // Clear form
      setFormData({
        name: '',
        category: '',
        description: '',
        goalAmount: '',
        startDate: '',
        endDate: '',
        imageUrl: '',
        documentUrl: ''
      });
      setUploadedImage(null);
      setUploadedDocument(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Create campaign error:', error);
      
      // Handle validation errors from backend
      if (error.errors && Array.isArray(error.errors)) {
        setError(error.errors.join(', '));
      } else if (error.error) {
        setError(error.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to create campaign. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="create-campaign-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please login to create a campaign.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-campaign-container">
      <div className="create-campaign-header">
        <h1>Create Your Campaign</h1>
        <p>Share your project with the world and raise funds for your cause</p>
      </div>

      <div className="create-campaign-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="create-campaign-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Campaign Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Give your campaign a compelling name"
                maxLength="100"
                required
              />
              <small>{formData.name.length}/100 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your campaign, its goals, and why people should support it... (minimum 10 characters)"
                rows="6"
                maxLength="2000"
                required
              />
              <small>
                {formData.description.length}/2000 characters 
                {formData.description.length < 10 && ' (minimum 10 required)'}
              </small>
            </div>
          </div>

          {/* Funding Details */}
          <div className="form-section">
            <h3>Funding Details</h3>
            
            <div className="form-group">
              <label htmlFor="goalAmount">Goal Amount (RM) *</label>
              <input
                type="number"
                id="goalAmount"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="1"
                max="1000000"
                step="0.01"
                required
              />
              <small>Amount between RM 1.00 and RM 1,000,000</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="form-section">
            <h3>Campaign Media</h3>
            
            <div className="upload-section">
              <h4>Campaign Image (Optional)</h4>
              <p>Upload a compelling image that represents your campaign</p>
              <FileUpload
                type="image"
                onUploadSuccess={handleImageUpload}
                onUploadError={handleImageUploadError}
                maxSize={5 * 1024 * 1024} // 5MB
                placeholder="Choose campaign image..."
              />
              {uploadedImage && (
                <div className="upload-preview">
                  <img src={uploadedImage.url} alt="Campaign" className="preview-image" />
                  <button 
                    type="button" 
                    className="remove-upload"
                    onClick={() => {
                      setUploadedImage(null);
                      setFormData({ ...formData, imageUrl: '' });
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="upload-section">
              <h4>Supporting Documents (Optional)</h4>
              <p>Upload documents that support your campaign (medical reports, certificates, etc.)</p>
              <FileUpload
                type="document"
                onUploadSuccess={handleDocumentUpload}
                onUploadError={handleDocumentUploadError}
                maxSize={10 * 1024 * 1024} // 10MB
                placeholder="Choose supporting document..."
              />
              {uploadedDocument && (
                <div className="upload-preview">
                  <div className="document-preview">
                    <span>📄 Document uploaded successfully</span>
                    <button 
                      type="button" 
                      className="remove-upload"
                      onClick={() => {
                        setUploadedDocument(null);
                        setFormData({ ...formData, documentUrl: '' });
                      }}
                    >
                      Remove Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
import React, { useState, useEffect } from 'react';
import { uploadService } from '../../services/uploadService';
import '../../styles/components/AdminDocumentViewer.css';

const AdminDocumentViewer = ({ 
  documentUrl, 
  campaignId, 
  campaignName,
  onDocumentAction 
}) => {
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (documentUrl) {
      loadDocumentInfo();
    }
  }, [documentUrl]);

  const loadDocumentInfo = async () => {
    if (!documentUrl) return;

    setLoading(true);
    setError('');

    try {
      // Extract document info from URL
      const info = parseDocumentUrl(documentUrl);
      setDocumentInfo(info);
    } catch (err) {
      console.error('Error loading document info:', err);
      setError('Failed to load document information');
    } finally {
      setLoading(false);
    }
  };

  const parseDocumentUrl = (url) => {
    if (!url) return null;

    // Extract filename and extension from Cloudinary URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Extract file extension
    const extension = filename.includes('.') ? 
      filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';

    // Determine file type
    let fileType = 'Unknown Document';
    let icon = '📄';
    let canPreview = false;

    switch (extension) {
      case '.pdf':
        fileType = 'PDF Document';
        icon = '📕';
        canPreview = true;
        break;
      case '.doc':
        fileType = 'Word Document (Legacy)';
        icon = '📘';
        canPreview = false;
        break;
      case '.docx':
        fileType = 'Word Document';
        icon = '📘';
        canPreview = false;
        break;
      default:
        fileType = 'Document';
        icon = '📄';
        canPreview = false;
    }

    return {
      filename,
      extension,
      fileType,
      icon,
      canPreview,
      url,
      uploadedAt: extractUploadTimestamp(url)
    };
  };

  const extractUploadTimestamp = (url) => {
    try {
      // Extract timestamp from Cloudinary URL (v1234567890 format)
      const versionMatch = url.match(/\/v(\d+)\//);
      if (versionMatch) {
        const timestamp = parseInt(versionMatch[1]);
        return new Date(timestamp * 1000).toISOString();
      }
    } catch (err) {
      console.error('Error extracting timestamp:', err);
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Unknown';
    }
  };

  const handleDownload = () => {
    if (!documentUrl) return;

    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentInfo?.filename || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track admin action
    if (onDocumentAction) {
      onDocumentAction('download', {
        campaignId,
        documentUrl,
        filename: documentInfo?.filename
      });
    }
  };

  const handlePreview = () => {
    if (!documentInfo?.canPreview) return;

    setShowPreview(true);

    // Track admin action
    if (onDocumentAction) {
      onDocumentAction('preview', {
        campaignId,
        documentUrl,
        filename: documentInfo?.filename
      });
    }
  };

  const handleApprove = () => {
    if (onDocumentAction) {
      onDocumentAction('approve', {
        campaignId,
        documentUrl,
        filename: documentInfo?.filename
      });
    }
  };

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejecting this document:');
    if (reason && reason.trim()) {
      if (onDocumentAction) {
        onDocumentAction('reject', {
          campaignId,
          documentUrl,
          filename: documentInfo?.filename,
          reason: reason.trim()
        });
      }
    }
  };

  if (!documentUrl) {
    return (
      <div className="admin-document-viewer no-document">
        <div className="no-document-icon">📄</div>
        <p>No supporting document provided</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-document-viewer loading">
        <div className="loading-spinner"></div>
        <p>Loading document information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-document-viewer error">
        <div className="error-icon">❌</div>
        <p>{error}</p>
        <button 
          className="retry-btn"
          onClick={loadDocumentInfo}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-document-viewer">
      <div className="document-header">
        <h3>Supporting Document</h3>
        <div className="campaign-info">
          <span className="campaign-name">{campaignName}</span>
          <span className="campaign-id">ID: {campaignId}</span>
        </div>
      </div>

      {documentInfo && (
        <div className="document-details">
          <div className="document-info">
            <div className="document-icon">
              {documentInfo.icon}
            </div>
            <div className="document-meta">
              <div className="document-name">{documentInfo.filename}</div>
              <div className="document-type">{documentInfo.fileType}</div>
              {documentInfo.uploadedAt && (
                <div className="upload-date">
                  Uploaded: {formatDate(documentInfo.uploadedAt)}
                </div>
              )}
            </div>
          </div>

          <div className="document-actions">
            <button 
              className="action-btn download-btn"
              onClick={handleDownload}
              title="Download document"
            >
              📥 Download
            </button>

            {documentInfo.canPreview && (
              <button 
                className="action-btn preview-btn"
                onClick={handlePreview}
                title="Preview document in new tab"
              >
                👁️ Preview
              </button>
            )}

            <button 
              className="action-btn approve-btn"
              onClick={handleApprove}
              title="Approve this document"
            >
              ✅ Approve
            </button>

            <button 
              className="action-btn reject-btn"
              onClick={handleReject}
              title="Reject this document"
            >
              ❌ Reject
            </button>
          </div>

          {documentInfo.canPreview && showPreview && (
            <div className="document-preview">
              <div className="preview-header">
                <h4>Document Preview</h4>
                <button 
                  className="close-preview"
                  onClick={() => setShowPreview(false)}
                >
                  ✖️
                </button>
              </div>
              <div className="preview-container">
                {documentInfo.extension === '.pdf' ? (
                  <iframe
                    src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    width="100%"
                    height="600px"
                    title="Document Preview"
                    frameBorder="0"
                  />
                ) : (
                  <div className="preview-not-available">
                    <p>Preview not available for this file type.</p>
                    <p>Please download the file to view its contents.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="document-security-info">
            <h4>🔒 Security Information</h4>
            <ul>
              <li>✅ Document is securely stored in Cloudinary</li>
              <li>✅ Direct URL access is controlled</li>
              <li>✅ File extension preserved: {documentInfo.extension}</li>
              <li>✅ Admin access logged and tracked</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentViewer;
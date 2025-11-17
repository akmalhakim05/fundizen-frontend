import React, { useState, useEffect } from 'react';

const AdminDocumentViewer = ({ 
  documentUrl, 
  campaignId, 
  campaignName,
  onDocumentAction 
}) => {
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true); // Auto-show preview
  const [viewMode, setViewMode] = useState('iframe'); // iframe or new-tab

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

    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const extension = filename.includes('.') ? 
      filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';

    let fileType = 'Unknown Document';
    let icon = 'File';
    let canPreview = false;

    switch (extension) {
      case '.pdf':
        fileType = 'PDF Document';
        icon = 'PDF';
        canPreview = true;
        break;
      case '.doc':
        fileType = 'Word Document (Legacy)';
        icon = 'Word';
        canPreview = true;
        break;
      case '.docx':
        fileType = 'Word Document';
        icon = 'Word';
        canPreview = true;
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        fileType = 'Image File';
        icon = 'Image';
        canPreview = true;
        break;
      default:
        fileType = 'Document';
        icon = 'File';
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
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentInfo?.filename || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onDocumentAction?.('download', { campaignId, documentUrl, filename: documentInfo?.filename });
  };

  const handleOpenInNewTab = () => {
    if (!documentUrl) return;
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
    onDocumentAction?.('preview', { campaignId, documentUrl, filename: documentInfo?.filename });
  };

  const handleApprove = () => {
    onDocumentAction?.('approve', { campaignId, documentUrl, filename: documentInfo?.filename });
  };

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejecting this document:');
    if (reason?.trim()) {
      onDocumentAction?.('reject', {
        campaignId,
        documentUrl,
        filename: documentInfo?.filename,
        reason: reason.trim()
      });
    }
  };

  const getViewerUrl = () => {
    if (!documentInfo) return '';
    const { extension, url } = documentInfo;

    if (extension === '.pdf' || extension === '.doc' || extension === '.docx') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
      return url;
    }
    return url;
  };

  if (!documentUrl) {
    return (
      <div className="admin-no-document">
        <div className="no-document-icon">File</div>
        <p>No supporting document provided</p>
        <p className="subtext">Campaign creator did not upload verification documents</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading document information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="error-icon">Cross</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={loadDocumentInfo}>Retry</button>
      </div>
    );
  }

  const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(documentInfo?.extension);

  return (
    <>
      <style jsx>{`
        /* =============== All CSS in one place =============== */
        .admin-document-viewer {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .title { margin: 0; font-size: 20px; font-weight: 600; }
        .campaign-info { display: flex; gap: 12px; align-items: center; font-size: 14px; margin-top: 8px; }
        .campaign-id { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }

        .info-bar {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        }
        .document-icon { font-size: 48px; }
        .document-name { font-weight: 600; font-size: 16px; word-break: break-all; margin-bottom: 4px; }
        .document-type { color: #3b82f6; font-weight: 500; font-size: 14px; }
        .upload-date { color: #6b7280; font-size: 12px; }

        .actions { display: flex; gap: 12px; padding: 16px 24px; flex-wrap: wrap; }
        .action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; border: none; border-radius: 6px;
          font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .download-btn { background: #3b82f6; color: white; }
        .new-tab-btn { background: #10b981; color: white; }
        .toggle-btn { background: #6b7280; color: white; }
        .approve-btn { background: #059669; color: white; flex: 1; justify-content: center; font-size: 16px; padding: 12px; }
        .reject-btn { background: #ef4444; color: white; flex: 1; justify-content: center; font-size: 16px; padding: 12px; }

        .preview-container { background: #fff; }
        .preview-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        }
        .view-mode-btn {
          padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px;
          background: white; font-size: 13px; cursor: pointer;
        }
        .view-mode-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

        .preview-content { min-height: 600px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
        .iframe-wrapper { width: 100%; position: relative; }
        .iframe { width: 100%; height: 600px; border: none; }
        .iframe-help { padding: 12px 24px; background: #fff8dc; border-top: 1px solid #ffd700; text-align: center; color: #856404; }
        .preview-image { max-width: 100%; max-height: 600px; object-fit: contain; }

        .quick-actions { display: flex; gap: 12px; padding: 20px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; }

        .security-info { padding: 20px 24px; background: #f0f9ff; border: 1px solid #bae6fd; }
        .security-info ul { padding-left: 20px; margin: 0; list-style: none; }
        .security-info li::before { content: "Check"; margin-right: 8px; }

        .notes-section { padding: 20px 24px; border-top: 1px solid #e5e7eb; }
        .notes-textarea {
          width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;
          font-family: inherit; resize: vertical;
        }

        .admin-no-document, .admin-loading, .admin-error {
          text-align: center; padding: 60px 20px; background: #f9fafb;
        }
        .spinner {
          width: 40px; height: 40px; border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6; border-radius: 50%;
          animation: spin 1s linear infinite; margin: 0 auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .actions, .quick-actions { flex-direction: column; }
          .action-btn, .approve-btn, .reject-btn { width: 100%; }
        }
      `}</style>

      <div className="admin-document-viewer">
        {/* Header */}
        <div className="header">
          <h3 className="title">Supporting Document</h3>
          <div className="campaign-info">
            <span>{campaignName}</span>
            <span className="campaign-id">ID: {campaignId}</span>
          </div>
        </div>

        {/* Document Info Bar */}
        <div className="info-bar">
          <div className="document-icon">{documentInfo.icon}</div>
          <div>
            <div className="document-name">{documentInfo.filename}</div>
            <div className="document-type">{documentInfo.fileType}</div>
            {documentInfo.uploadedAt && <div className="upload-date">Uploaded: {formatDate(documentInfo.uploadedAt)}</div>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions">
          <button className="action-btn download-btn" onClick={handleDownload}>Download</button>
          <button className="action-btn new-tab-btn" onClick={handleOpenInNewTab}>Open in New Tab</button>
          <button className="action-btn toggle-btn" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Preview */}
        {showPreview && documentInfo.canPreview && (
          <div className="preview-container">
            <div className="preview-header">
              <h4>Document Preview</h4>
              {!isImage && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={`view-mode-btn ${viewMode === 'iframe' ? 'active' : ''}`} onClick={() => setViewMode('iframe')}>
                    Embedded View
                  </button>
                  <button className={`view-mode-btn ${viewMode === 'new-tab' ? 'active' : ''}`} onClick={() => setViewMode('new-tab')}>
                    External View
                  </button>
                </div>
              )}
            </div>

            <div className="preview-content">
              {isImage ? (
                <img src={documentInfo.url} alt={documentInfo.filename} className="preview-image" />
              ) : viewMode === 'iframe' ? (
                <div className="iframe-wrapper">
                  <iframe src={getViewerUrl()} className="iframe" title="Document Preview" />
                  <div className="iframe-help">
                    <p>If the document doesn't load, try "Open in New Tab" or "Download"</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ fontSize: '18px' }}>Click "Open in New Tab" to view the document</p>
                  <button className="action-btn new-tab-btn" onClick={handleOpenInNewTab}>Open Document</button>
                </div>
              )}
            </div>

            <div className="quick-actions">
              <button className="action-btn approve-btn" onClick={handleApprove}>Approve Campaign</button>
              <button className="action-btn reject-btn" onClick={handleReject}>Reject Campaign</button>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="security-info">
          <h4 style={{ margin: '0 0 12px', color: '#0369a1' }}>Security Information</h4>
          <ul>
            <li>Document is securely stored in Cloud Storage</li>
            <li>Direct URL access is controlled</li>
            <li>File extension preserved: {documentInfo.extension}</li>
            <li>Admin access logged and tracked</li>
          </ul>
        </div>

        {/* Notes */}
        <div className="notes-section">
          <h4 style={{ margin: '0 0 12px' }}>Admin Review Notes</h4>
          <textarea className="notes-textarea" placeholder="Add your review notes here (optional)..." rows={3} />
          <button className="action-btn" style={{ background: '#8b5cf6', color: 'white', marginTop: '12px' }}>Save Notes</button>
        </div>
      </div>
    </>
  );
};

export default AdminDocumentViewer;
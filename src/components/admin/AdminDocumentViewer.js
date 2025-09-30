
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
        canPreview = true;
        break;
      case '.docx':
        fileType = 'Word Document';
        icon = '📘';
        canPreview = true;
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        fileType = 'Image File';
        icon = '🖼️';
        canPreview = true;
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

    if (onDocumentAction) {
      onDocumentAction('download', {
        campaignId,
        documentUrl,
        filename: documentInfo?.filename
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (!documentUrl) return;
    window.open(documentUrl, '_blank', 'noopener,noreferrer');

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

  const getViewerUrl = () => {
    if (!documentInfo) return '';
    
    const { extension, url } = documentInfo;
    
    // Check if URL needs CORS proxy for Google Cloud Storage
    const needsCorsProxy = url.includes('storage.googleapis.com');
    
    // For PDF files
    if (extension === '.pdf') {
      // Option 1: Use Google Docs Viewer (works with public URLs)
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      
      // Option 2: Use Mozilla PDF.js viewer (alternative)
      // return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    }
    
    // For Word documents, use Google Docs Viewer
    if (extension === '.doc' || extension === '.docx') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      
      // Alternative: Use Office Online Viewer
      // return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    
    // For images, return the URL directly
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
      return url;
    }
    
    return url;
  };

  if (!documentUrl) {
    return (
      <div style={styles.noDocument}>
        <div style={styles.noDocumentIcon}>📄</div>
        <p style={styles.noDocumentText}>No supporting document provided</p>
        <p style={styles.noDocumentSubtext}>
          Campaign creator did not upload verification documents
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading document information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div style={styles.errorIcon}>❌</div>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryBtn} onClick={loadDocumentInfo}>
          Retry
        </button>
      </div>
    );
  }

  const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(documentInfo?.extension);

  return (
    <div style={styles.container}>
      {/* Document Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>📄 Supporting Document</h3>
          <div style={styles.campaignInfo}>
            <span style={styles.campaignName}>{campaignName}</span>
            <span style={styles.campaignId}>ID: {campaignId}</span>
          </div>
        </div>
      </div>

      {documentInfo && (
        <>
          {/* Document Info Bar */}
          <div style={styles.infoBar}>
            <div style={styles.documentIcon}>{documentInfo.icon}</div>
            <div style={styles.documentMeta}>
              <div style={styles.documentName}>{documentInfo.filename}</div>
              <div style={styles.documentType}>{documentInfo.fileType}</div>
              {documentInfo.uploadedAt && (
                <div style={styles.uploadDate}>
                  Uploaded: {formatDate(documentInfo.uploadedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button 
              style={{...styles.actionBtn, ...styles.downloadBtn}}
              onClick={handleDownload}
              title="Download document"
            >
              📥 Download
            </button>

            <button 
              style={{...styles.actionBtn, ...styles.newTabBtn}}
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              🔗 Open in New Tab
            </button>

            <button 
              style={{...styles.actionBtn, ...styles.toggleBtn}}
              onClick={() => setShowPreview(!showPreview)}
              title="Toggle preview"
            >
              {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
            </button>
          </div>

          {/* Document Preview */}
          {showPreview && documentInfo.canPreview && (
            <div style={styles.previewContainer}>
              <div style={styles.previewHeader}>
                <h4 style={styles.previewTitle}>📄 Document Preview</h4>
                <div style={styles.viewModeToggle}>
                  {!isImage && (
                    <>
                      <button
                        style={{
                          ...styles.viewModeBtn,
                          ...(viewMode === 'iframe' ? styles.viewModeBtnActive : {})
                        }}
                        onClick={() => setViewMode('iframe')}
                      >
                        📱 Embedded View
                      </button>
                      <button
                        style={{
                          ...styles.viewModeBtn,
                          ...(viewMode === 'new-tab' ? styles.viewModeBtnActive : {})
                        }}
                        onClick={() => setViewMode('new-tab')}
                      >
                        🔗 External View
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={styles.previewContent}>
                {isImage ? (
                  <img 
                    src={documentInfo.url} 
                    alt={documentInfo.filename}
                    style={styles.previewImage}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="padding: 60px; text-align: center; color: #ef4444;"><p>❌ Unable to load image</p><p style="font-size: 14px; color: #6b7280;">Try opening in a new tab</p></div>';
                    }}
                  />
                ) : viewMode === 'iframe' ? (
                  <div style={styles.iframeWrapper}>
                    <iframe
                      src={getViewerUrl()}
                      style={styles.iframe}
                      title="Document Preview"
                      frameBorder="0"
                      onError={(e) => {
                        console.error('iframe load error:', e);
                      }}
                    />
                    <div style={styles.iframeHelp}>
                      <p style={styles.iframeHelpText}>
                        💡 If the document doesn't load, click "Open in New Tab" or "Download"
                      </p>
                      <p style={styles.iframeHelpSubtext}>
                        Google Cloud Storage documents may require direct access
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={styles.externalViewMessage}>
                    <div style={styles.externalViewIcon}>🔗</div>
                    <p style={styles.externalViewText}>
                      Click "Open in New Tab" to view this document
                    </p>
                    <button 
                      style={{...styles.actionBtn, ...styles.newTabBtn, marginBottom: '12px'}}
                      onClick={handleOpenInNewTab}
                    >
                      🔗 Open Document in New Tab
                    </button>
                    <p style={styles.externalViewSubtext}>
                      Document URL: {documentInfo.url.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions Below Preview */}
              <div style={styles.quickActions}>
                <button 
                  style={{...styles.actionBtn, ...styles.approveBtn}}
                  onClick={handleApprove}
                  title="Approve this document and campaign"
                >
                  ✅ Approve Campaign
                </button>

                <button 
                  style={{...styles.actionBtn, ...styles.rejectBtn}}
                  onClick={handleReject}
                  title="Reject this document and campaign"
                >
                  ❌ Reject Campaign
                </button>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div style={styles.securityInfo}>
            <h4 style={styles.securityTitle}>🔒 Security Information</h4>
            <ul style={styles.securityList}>
              <li>✅ Document is securely stored in Cloudinary</li>
              <li>✅ Direct URL access is controlled</li>
              <li>✅ File extension preserved: {documentInfo.extension}</li>
              <li>✅ Admin access logged and tracked</li>
              <li>✅ Document type: {documentInfo.fileType}</li>
            </ul>
          </div>

          {/* Admin Notes Section */}
          <div style={styles.notesSection}>
            <h4 style={styles.notesTitle}>📝 Admin Review Notes</h4>
            <textarea 
              style={styles.notesTextarea}
              placeholder="Add your review notes here (optional)..."
              rows={3}
            />
            <button style={{...styles.actionBtn, ...styles.saveNotesBtn}}>
              💾 Save Notes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  campaignInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    fontSize: '14px',
  },
  campaignName: {
    fontWeight: '500',
    opacity: 0.9,
  },
  campaignId: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  documentIcon: {
    fontSize: '48px',
    minWidth: '60px',
    textAlign: 'center',
  },
  documentMeta: {
    flex: 1,
  },
  documentName: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '16px',
    wordBreak: 'break-all',
    marginBottom: '4px',
  },
  documentType: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: '14px',
    marginBottom: '2px',
  },
  uploadDate: {
    color: '#6b7280',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  downloadBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  newTabBtn: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  toggleBtn: {
    backgroundColor: '#6b7280',
    color: 'white',
  },
  approveBtn: {
    backgroundColor: '#059669',
    color: 'white',
    flex: 1,
    justifyContent: 'center',
    fontSize: '16px',
    padding: '12px 24px',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    flex: 1,
    justifyContent: 'center',
    fontSize: '16px',
    padding: '12px 24px',
  },
  saveNotesBtn: {
    backgroundColor: '#8b5cf6',
    color: 'white',
    marginTop: '12px',
  },
  previewContainer: {
    backgroundColor: '#ffffff',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  previewTitle: {
    margin: 0,
    color: '#374151',
    fontSize: '16px',
    fontWeight: '600',
  },
  viewModeToggle: {
    display: 'flex',
    gap: '8px',
  },
  viewModeBtn: {
    padding: '6px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewModeBtnActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  previewContent: {
    padding: '0',
    minHeight: '600px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iframe: {
    width: '100%',
    height: '600px',
    border: 'none',
  },
  iframeWrapper: {
    width: '100%',
    position: 'relative',
  },
  iframeHelp: {
    padding: '12px 24px',
    backgroundColor: '#fff8dc',
    borderTop: '1px solid #ffd700',
    textAlign: 'center',
  },
  iframeHelpText: {
    margin: '0 0 4px 0',
    color: '#856404',
    fontSize: '14px',
    fontWeight: '500',
  },
  iframeHelpSubtext: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '600px',
    objectFit: 'contain',
  },
  externalViewMessage: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  externalViewIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  externalViewText: {
    color: '#374151',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '500',
  },
  externalViewSubtext: {
    color: '#9ca3af',
    fontSize: '12px',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  quickActions: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  securityInfo: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '0',
    padding: '20px 24px',
  },
  securityTitle: {
    margin: '0 0 12px 0',
    color: '#0369a1',
    fontSize: '14px',
    fontWeight: '600',
  },
  securityList: {
    margin: 0,
    paddingLeft: '20px',
    listStyle: 'none',
  },
  notesSection: {
    padding: '20px 24px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
  },
  notesTitle: {
    margin: '0 0 12px 0',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '600',
  },
  notesTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  noDocument: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9fafb',
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    color: '#6b7280',
  },
  noDocumentIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  noDocumentText: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  noDocumentSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: '#6b7280',
  },
  error: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    color: '#dc2626',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorText: {
    marginBottom: '20px',
  },
  retryBtn: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AdminDocumentViewer;
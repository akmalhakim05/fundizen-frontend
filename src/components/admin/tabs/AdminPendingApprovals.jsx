// src/components/admin/tabs/AdminPendingApprovals.jsx
import React, { useState, useEffect } from 'react';
import campaignService from '../../../services/campaignService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { 
  CheckCircle, XCircle, FileText, Clock, Sparkles, 
  Calendar, Target, User, AlertCircle, ExternalLink 
} from 'lucide-react';

const AdminPendingApprovals = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getPendingCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error('Failed to load pending campaigns:', err);
      alert('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this campaign? It will go live immediately.')) return;
    setProcessingId(id);
    try {
      await campaignService.approveCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to approve campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (will be sent to creator):');
    if (reason === null) return;
    setProcessingId(id);
    try {
      await campaignService.rejectCampaign(id, reason || 'No reason provided');
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to reject campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const openDocumentModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  // Determine if file is PDF or image
  const getFileType = (url) => {
    if (!url) return null;
    const ext = url.split('.').pop().toLowerCase();
    return ['pdf'].includes(ext) ? 'pdf' : ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' : 'unknown';
  };

  if (loading) return <LoadingSpinner message="Loading pending campaigns..." />;

  return (
    <div className="admin-pending-approvals">
      {/* Header */}
      <div className="header-section">
        <h1>
          <FileText size={40} />
          Pending Campaign Approvals
        </h1>
        <p className="subtitle">
          {campaigns.length === 0 ? (
            <>All caught up! No campaigns awaiting review.</>
          ) : (
            <>
              <Clock size={20} /> 
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} 
              pending approval
            </>
          )}
        </p>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="empty-state">
          <div className="celebration">
            <Sparkles size={80} />
          </div>
          <h2>All caught up!</h2>
          <p>No pending campaigns to review right now. Great job staying on top of things!</p>
        </div>
      )}

      {/* Campaign Cards Grid */}
      <div className="pending-grid">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="pending-card">
            {/* Campaign Image */}
            <div className="image-container">
              {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt={campaign.name} className="campaign-image" />
              ) : (
                <div className="placeholder-image">
                  <FileText size={80} />
                </div>
              )}
              <div className="campaign-id-badge">
                ID: {campaign.id.slice(-8)}
              </div>
            </div>

            {/* Card Content */}
            <div className="card-content">
              <div className="card-header">
                <div>
                  <h3 className="campaign-title">{campaign.name}</h3>
                  <div className="meta-grid">
                    <p><User size={16} /> <strong>{campaign.username}</strong></p>
                    <p><Target size={16} /> RM{campaign.goalAmount.toLocaleString()}</p>
                    <p><Calendar size={16} /> {new Date(campaign.startDate).toLocaleDateString()} → {new Date(campaign.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="status-badge pending">PENDING REVIEW</span>
              </div>

              <p className="campaign-category">
                <strong>Category:</strong> {campaign.category}
              </p>

              <p className="campaign-description">
                {campaign.description || 'No description provided.'}
              </p>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={() => handleApprove(campaign.id)}
                  disabled={processingId === campaign.id}
                  className="btn approve"
                >
                  <CheckCircle size={20} />
                  {processingId === campaign.id ? 'Approving...' : 'Approve'}
                </button>

                <button
                  onClick={() => handleReject(campaign.id)}
                  disabled={processingId === campaign.id}
                  className="btn reject"
                >
                  <XCircle size={20} />
                  Reject
                </button>

                {campaign.documentUrl ? (
                  <button
                    onClick={() => openDocumentModal(campaign)}
                    className="btn document"
                  >
                    <ExternalLink size={20} />
                    View Document
                  </button>
                ) : (
                  <button className="btn document missing" disabled>
                    <AlertCircle size={20} />
                    No Document
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Iframe Document Viewer Modal */}
      {isModalOpen && selectedCampaign && selectedCampaign.documentUrl && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="document-viewer-header">
              <h2>{selectedCampaign.name}</h2>
              <p>Document Preview • Campaign ID: {selectedCampaign.id.slice(-8)}</p>
            </div>

            <div className="document-container">
              {getFileType(selectedCampaign.documentUrl) === 'pdf' ? (
                <iframe
                  src={selectedCampaign.documentUrl}
                  title="Document Preview"
                  className="document-iframe"
                  frameBorder="0"
                  allowFullScreen
                />
              ) : getFileType(selectedCampaign.documentUrl) === 'image' ? (
                <img 
                  src={selectedCampaign.documentUrl} 
                  alt="Document" 
                  className="document-image"
                />
              ) : (
                <div className="document-fallback">
                  <AlertCircle size={60} />
                  <p>Preview not available for this file type.</p>
                  <a 
                    href={selectedCampaign.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn download-btn"
                  >
                    <ExternalLink size={20} />
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons inside Modal */}
            <div className="modal-actions">
              <button onClick={() => { handleApprove(selectedCampaign.id); closeModal(); }} className="btn approve large">
                <CheckCircle size={24} /> Approve Campaign
              </button>
              <button 
                onClick={() => {
                  const reason = prompt('Reason for rejection:');
                  if (reason !== null) {
                    campaignService.rejectCampaign(selectedCampaign.id, reason || 'Rejected after document review');
                    setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
                    closeModal();
                  }
                }} 
                className="btn reject large"
              >
                <XCircle size={24} /> Reject Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updated Styles */}
      <style jsx>{`
        /* ... (keep all your existing styles) ... */

        /* New styles for iframe modal */
        .document-viewer-header {
          padding: 24px 32px 0;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .document-viewer-header h2 {
          font-size: 1.8rem;
          margin: 0 0 8px 0;
          color: #0f172a;
        }

        .document-viewer-header p {
          color: #64748b;
          font-size: 0.95rem;
        }

        .document-container {
          height: 70vh;
          min-height: 500px;
          background: #f8fafc;
          position: relative;
        }

        .document-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .document-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        .document-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
          gap: 20px;
        }

        .modal-actions {
          padding: 24px 32px;
          display: flex;
          gap: 16px;
          border-top: 1px solid #e2e8f0;
          background: white;
        }

        .modal-actions .btn.large {
          flex: 1;
          padding: 18px;
          font-size: 1.1rem;
        }

        .download-btn {
          background: #6366f1;
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .admin-pending-approvals {
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .header-section h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 0 12px 0;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .empty-state {
          background: white;
          border-radius: 28px;
          padding: 80px 40px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          margin-top: 40px;
        }

        .celebration {
          color: #10b981;
          margin-bottom: 24px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .empty-state h2 {
          font-size: 3rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 16px 0;
        }

        .empty-state p {
          font-size: 1.3rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        .pending-grid {
          display: grid;
          gap: 32px;
          margin-top: 40px;
        }

        .pending-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: 420px 1fr;   /* Fixed image width on large screens */
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pending-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }

        .image-container {
          width: 100%;                 /* Full width on mobile, fixed on desktop */
          aspect-ratio: 16 / 9;        /* Forces 1024×576 ratio */
          position: relative;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .campaign-image {
          width: 100%;
          height: 100%;
          object-fit: cover;           /* Crop nicely if not exact ratio */
          object-position: center;
          transition: transform 0.6s ease;
        } 

        .pending-card:hover .campaign-image {
          transform: scale(1.08);
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .card-content {
          flex: 1;
          padding: 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .campaign-title {
          font-size: 1.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .campaign-meta {
          font-size: 1.05rem;
          color: #64748b;
          margin: 0;
        }

        .status-badge {
          background: linear-gradient(135deg, #fff7ed, #fed7aa);
          color: #c2410c;
          padding: 10px 20px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .campaign-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #475569;
          margin-bottom: 32px;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
        }

        .btn {
          flex: 1;
          padding: 16px 24px;
          border-radius: 18px;
          font-weight: 600;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn.approve {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
        }

        .btn.reject {
          background: linear-gradient(135deg, #ef4444, #f87171);
          color: white;
        }

        .btn.view {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #475569;
        }

        .btn:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 1024px) {
          .pending-card {
              grid-template-columns: 1fr;
          }
          .image-container {
              height: 280px;   /* fallback height on smaller screens */
          }
          .placeholder-image {
            width: 100%;
            height: 300px;
          }
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 12px 0;
          font-size: 0.95rem;
          color: #475569;
        }

        .meta-grid p {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }

        .campaign-category {
          background: #f0fdf4;
          color: #166534;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-block;
          margin: 12px 0;
        }

        .campaign-id-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 10px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .status-badge.pending {
          background: linear-gradient(135deg, #fff7ed, #fed7aa);
          color: #c2410c;
        }

        .btn.document {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .btn.document.missing {
          background: #e5e7eb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .btn.document:hover:not(.missing) {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .modal-content {
          position: relative;
          max-width: 900px;
          width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          border-radius: 16px;
          background: white;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 28px;
          border: none;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .pending-card {
            flex-direction: column;
          }
          .image-container {
            height: 280px;
          }
          .action-buttons {
            grid-template-columns: 1fr;
          }
          .meta-grid {
            grid-template-columns: 1fr;
          }
        }

        .btn.document {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .modal-content {
          position: relative;
          max-width: 1000px;
          width: 100%;
          max-height: 95vh;
          border-radius: 20px;
          background: white;
          box-shadow: 0 30px 80px rgba(0,0,0,0.3);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 32px;
          border: none;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .modal-actions {
            flex-direction: column;
          }
          .document-container {
            height: 60vh;
          }
        }

        @media (max-width: 640px) {
          .admin-pending-approvals {
            padding: 24px;
          }
          .action-buttons {
            flex-direction: column;
          }
          .header-section h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPendingApprovals;
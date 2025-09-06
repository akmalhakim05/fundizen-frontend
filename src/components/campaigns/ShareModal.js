import React, { useState } from 'react';
import '../../styles/components/ShareModal.css';

const ShareModal = ({ campaign, onClose }) => {
  const [copied, setCopied] = useState(false);

  const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
  
  const shareText = `Check out this amazing campaign: "${campaign.name}" by ${campaign.creatorUsername}. Help them reach their goal of RM ${campaign.goalAmount.toLocaleString()}!`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${campaignUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(`Support: ${campaign.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${campaignUrl}`)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = campaignUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform) => {
    const url = shareLinks[platform];
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="share-modal-overlay" onClick={handleOverlayClick}>
      <div className="share-modal">
        <div className="modal-header">
          <h2>Share Campaign</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="campaign-preview">
            <div className="campaign-image">
              {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt={campaign.name} />
              ) : (
                <div className="placeholder-image">
                  📋
                </div>
              )}
            </div>
            <div className="campaign-info">
              <h3>{campaign.name}</h3>
              <p>by {campaign.creatorUsername}</p>
              <div className="funding-info">
                RM {campaign.raisedAmount.toLocaleString()} raised of RM {campaign.goalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="share-options">
            <h3>Share via Social Media</h3>
            <div className="social-buttons">
              <button 
                className="social-btn facebook"
                onClick={() => handleSocialShare('facebook')}
              >
                <span className="social-icon">📘</span>
                Facebook
              </button>
              
              <button 
                className="social-btn twitter"
                onClick={() => handleSocialShare('twitter')}
              >
                <span className="social-icon">🐦</span>
                Twitter
              </button>
              
              <button 
                className="social-btn linkedin"
                onClick={() => handleSocialShare('linkedin')}
              >
                <span className="social-icon">💼</span>
                LinkedIn
              </button>
              
              <button 
                className="social-btn whatsapp"
                onClick={() => handleSocialShare('whatsapp')}
              >
                <span className="social-icon">💬</span>
                WhatsApp
              </button>
              
              <button 
                className="social-btn telegram"
                onClick={() => handleSocialShare('telegram')}
              >
                <span className="social-icon">✈️</span>
                Telegram
              </button>
              
              <button 
                className="social-btn email"
                onClick={() => handleSocialShare('email')}
              >
                <span className="social-icon">📧</span>
                Email
              </button>
            </div>
          </div>

          <div className="copy-link-section">
            <h3>Or copy link</h3>
            <div className="copy-link-container">
              <input 
                type="text" 
                value={campaignUrl} 
                readOnly
                className="link-input"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            {copied && (
              <div className="copy-success">
                Link copied to clipboard! Share it anywhere.
              </div>
            )}
          </div>

          <div className="share-tips">
            <h3>💡 Sharing Tips</h3>
            <ul>
              <li>Share on multiple platforms to reach more supporters</li>
              <li>Add a personal message about why this campaign matters</li>
              <li>Tag friends who might be interested in supporting</li>
              <li>Share regular updates to keep momentum going</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
/**
 * ShareButton Component
 * 
 * Generates a shareable link containing the current org data.
 * Link can be bookmarked or shared - no account needed.
 */

import { useState } from 'react';
import { Link2, Check, Copy } from 'lucide-react';
import { useOrg } from '../context/OrgContext';
import { generateShareUrl, copyToClipboard } from '../utils/shareUtils';

export function ShareButton() {
  const { state, currentOrgName } = useOrg();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = () => {
    const url = generateShareUrl(state, currentOrgName);
    setShareUrl(url);
    setIsOpen(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShareUrl('');
  };

  return (
    <>
      <button className="btn-secondary" onClick={handleShare} title="Get shareable link">
        <Link2 size={18} />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
            <div className="share-header">
              <h3>Share "{currentOrgName}"</h3>
              <p>Anyone with this link can view a copy of your org</p>
            </div>

            <div className="share-url-container">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="share-tips">
              <p><strong>💡 Tip:</strong> Bookmark this link to save your org map!</p>
              <p className="share-note">The link contains all your data - no account needed.</p>
            </div>

            <button className="share-close-btn" onClick={handleClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

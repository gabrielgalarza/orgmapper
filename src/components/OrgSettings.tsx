/**
 * OrgSettings Component
 * 
 * Modal for configuring org-level settings like product access.
 */

import { X, Settings, BarChart3, FlaskConical, Video, MessageSquare, Check } from 'lucide-react';
import type { AmplitudeProduct } from '../types';
import { useOrg } from '../context/OrgContext';

interface OrgSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const productConfig: { id: AmplitudeProduct; icon: typeof BarChart3; label: string; description: string; color: string }[] = [
  { id: 'analytics', icon: BarChart3, label: 'Analytics', description: 'Event tracking & insights', color: '#00d9ff' },
  { id: 'experiment', icon: FlaskConical, label: 'Experiment', description: 'A/B testing & feature flags', color: '#a855f7' },
  { id: 'session-replay', icon: Video, label: 'Session Replay', description: 'User session recordings', color: '#22c55e' },
  { id: 'guides-surveys', icon: MessageSquare, label: 'Guides & Surveys', description: 'In-app guidance & feedback', color: '#f97316' },
];

export function OrgSettings({ isOpen, onClose }: OrgSettingsProps) {
  const { state, toggleOrgProduct, currentOrgName } = useOrg();
  const orgProducts = state.orgProducts || [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content org-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={20} />
            <h2>Org Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-section">
          <h3>Amplitude Products</h3>
          <p className="settings-description">
            Select which Amplitude products <strong>{currentOrgName}</strong> has access to. 
            Teams can only be marked as onboarded to products the org has.
          </p>
          
          <div className="product-list">
            {productConfig.map(product => {
              const Icon = product.icon;
              const isActive = orgProducts.includes(product.id);
              
              return (
                <button
                  key={product.id}
                  className={`product-option ${isActive ? 'active' : ''}`}
                  onClick={() => toggleOrgProduct(product.id)}
                  style={{ '--product-color': product.color } as React.CSSProperties}
                >
                  <div className="product-icon">
                    <Icon size={20} />
                  </div>
                  <div className="product-info">
                    <span className="product-name">{product.label}</span>
                    <span className="product-desc">{product.description}</span>
                  </div>
                  <div className="product-check">
                    {isActive && <Check size={18} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

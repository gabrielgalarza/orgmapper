/**
 * WelcomeToast Component
 * 
 * Shows a brief notification on first visit explaining how data is saved.
 */

import { useState, useEffect } from 'react';
import { X, Bookmark, Info } from 'lucide-react';

const WELCOME_SHOWN_KEY = 'orgmapper_welcome_shown';

export function WelcomeToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we've shown the welcome message before
    const hasShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    if (!hasShown) {
      // Show after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="welcome-toast">
      <div className="welcome-icon">
        <Info size={20} />
      </div>
      <div className="welcome-content">
        <p className="welcome-title">Your org chart saves in this browser</p>
        <p className="welcome-text">
          <Bookmark size={14} /> <strong>Bookmark</strong> or <strong>Share</strong> the link to access it later from any device
        </p>
      </div>
      <button className="welcome-close" onClick={() => setIsVisible(false)}>
        <X size={16} />
      </button>
    </div>
  );
}

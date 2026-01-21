/**
 * App - Root Component
 * 
 * Entry point for the Org Mapper application.
 * Wraps everything in the OrgProvider for global state.
 */

import { useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { OrgProvider, useOrg } from './context/OrgContext';
import { OrgBoard, Header, AddPersonModal, OrgSettings } from './components';
import { getSharedOrgFromUrl, clearUrlParams } from './utils/shareUtils';
import './App.css';

// Clear localStorage and reload
function resetApp() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('orgmapper'));
  keys.forEach(k => localStorage.removeItem(k));
  window.location.reload();
}

// Error boundary to catch rendering errors
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff6b6b', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ marginBottom: '20px' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#0d1117', padding: '20px', borderRadius: '8px', overflow: 'auto', marginBottom: '20px' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={resetApp}
            style={{
              padding: '12px 24px',
              background: '#00d9ff',
              color: '#0d1117',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Reset App & Clear Data
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component to handle loading shared orgs from URL
function SharedOrgLoader() {
  const { importSharedOrg } = useOrg();
  const [showBanner, setShowBanner] = useState(false);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    const shared = getSharedOrgFromUrl();
    if (shared) {
      importSharedOrg(shared.state, shared.name);
      setOrgName(shared.name);
      setShowBanner(true);
      clearUrlParams();
      
      // Hide banner after 5 seconds
      setTimeout(() => setShowBanner(false), 5000);
    }
  }, [importSharedOrg]);

  if (!showBanner) return null;

  return (
    <div className="shared-banner">
      <span>✨ Loaded shared org: <strong>{orgName}</strong></span>
      <button onClick={() => setShowBanner(false)}>×</button>
    </div>
  );
}

function AppContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="app">
      <SharedOrgLoader />
      <Header 
        onAddPerson={() => setIsAddModalOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="main-content">
        <OrgBoard />
      </main>
      <AddPersonModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      <OrgSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <OrgProvider>
        <AppContent />
      </OrgProvider>
    </ErrorBoundary>
  );
}

export default App;

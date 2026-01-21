/**
 * Header Component
 * 
 * App header with org switcher and quick actions
 */

import { Plus, Network, Settings } from 'lucide-react';
import { OrgSwitcher } from './OrgSwitcher';
import { ShareButton } from './ShareButton';

interface HeaderProps {
  onAddPerson: () => void;
  onOpenSettings: () => void;
}

export function Header({ onAddPerson, onOpenSettings }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <Network size={24} />
        </div>
        <div className="header-title">
          <h1>OrgMapper</h1>
        </div>
        <OrgSwitcher />
      </div>

      <div className="header-actions">
        <button className="btn-icon" onClick={onOpenSettings} title="Org Settings">
          <Settings size={18} />
        </button>
        <ShareButton />
        <button className="btn-primary" onClick={onAddPerson}>
          <Plus size={18} />
          <span>Add Contact</span>
        </button>
      </div>
    </header>
  );
}

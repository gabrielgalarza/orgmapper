/**
 * OrgSwitcher Component
 * 
 * Dropdown for switching between saved organizations,
 * creating new ones, and import/export functionality.
 */

import { useState, useRef } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Download, 
  Upload, 
  Trash2,
  Check,
  Building2
} from 'lucide-react';
import { useOrg } from '../context/OrgContext';

export function OrgSwitcher() {
  const {
    currentOrgId,
    currentOrgName,
    savedOrgs,
    loadOrg,
    createNewOrg,
    deleteOrg,
    exportOrg,
    importOrg,
  } = useOrg();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateOrg = () => {
    if (newOrgName.trim()) {
      createNewOrg(newOrgName.trim());
      setNewOrgName('');
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  const handleExport = () => {
    const data = exportOrg();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentOrgName.replace(/[^a-z0-9]/gi, '_')}_org.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const name = file.name.replace('.json', '').replace(/_/g, ' ');
        importOrg(data, name);
        setIsOpen(false);
      } catch (err) {
        alert('Failed to import org data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    e.target.value = '';
  };

  const handleDelete = (orgId: string) => {
    if (deleteConfirm === orgId) {
      deleteOrg(orgId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(orgId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="org-switcher">
      <button 
        className="org-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building2 size={16} />
        <span className="org-name-display">{currentOrgName}</span>
        <ChevronDown size={14} className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <>
          <div className="org-switcher-backdrop" onClick={() => setIsOpen(false)} />
          <div className="org-switcher-dropdown">
            <div className="dropdown-header">
              <span>Organizations</span>
            </div>

            <div className="org-list">
              {savedOrgs.map(org => (
                <div 
                  key={org.id}
                  className={`org-item ${org.id === currentOrgId ? 'active' : ''}`}
                >
                  <button
                    className="org-item-select"
                    onClick={() => {
                      loadOrg(org.id);
                      setIsOpen(false);
                    }}
                  >
                    {org.id === currentOrgId && <Check size={14} />}
                    <span>{org.name}</span>
                  </button>
                  {savedOrgs.length > 1 && (
                    <button
                      className={`org-item-delete ${deleteConfirm === org.id ? 'confirm' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(org.id);
                      }}
                      title={deleteConfirm === org.id ? 'Click again to confirm' : 'Delete org'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="dropdown-divider" />

            {isCreating ? (
              <div className="create-org-form">
                <input
                  type="text"
                  placeholder="Organization name..."
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
                  autoFocus
                />
                <button onClick={handleCreateOrg} disabled={!newOrgName.trim()}>
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <button className="dropdown-action" onClick={() => setIsCreating(true)}>
                <Plus size={14} />
                <span>New Organization</span>
              </button>
            )}

            <div className="dropdown-divider" />

            <button className="dropdown-action" onClick={handleExport}>
              <Download size={14} />
              <span>Export as JSON</span>
            </button>

            <button className="dropdown-action" onClick={handleImportClick}>
              <Upload size={14} />
              <span>Import from JSON</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </>
      )}
    </div>
  );
}

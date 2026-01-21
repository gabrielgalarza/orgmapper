/**
 * PersonDetail Component
 * 
 * Side panel for viewing and editing person details.
 * Shows full information, reporting structure, and allows quick edits.
 */

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Edit2, 
  Trash2, 
  Check,
  Star,
  Zap,
  Crown,
  Users,
  AlertTriangle,
  ChevronDown,
  Pencil
} from 'lucide-react';
import type { Person, PersonTag, RoleLevel } from '../types';
import { useOrg } from '../context/OrgContext';

interface PersonDetailProps {
  person: Person;
  onClose: () => void;
}

const tagConfig: Record<PersonTag, { icon: typeof Star; color: string; label: string }> = {
  'power-user': { icon: Zap, color: '#fbbf24', label: 'Power User' },
  'champion': { icon: Star, color: '#34d399', label: 'Champion' },
  'decision-maker': { icon: Crown, color: '#a78bfa', label: 'Decision Maker' },
  'influencer': { icon: Users, color: '#60a5fa', label: 'Influencer' },
  'blocker': { icon: AlertTriangle, color: '#f87171', label: 'Blocker' },
};

const levelLabels: Record<RoleLevel, string> = {
  executive: 'Executive',
  vp: 'VP',
  director: 'Director',
  manager: 'Manager',
  ic: 'Individual Contributor',
};

const levelOptions: RoleLevel[] = ['executive', 'vp', 'director', 'manager', 'ic'];

export function PersonDetail({ person, onClose }: PersonDetailProps) {
  const { 
    getPersonById, 
    getDirectReports, 
    getTeamList,
    deletePerson,
    toggleTag,
    setReportsTo,
    movePerson,
    updatePerson,
    state
  } = useOrg();
  
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Edit states for person details
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  
  const [editName, setEditName] = useState(person.name);
  const [editRole, setEditRole] = useState(person.role);
  const [editEmail, setEditEmail] = useState(person.email || '');
  const [editLevel, setEditLevel] = useState(person.level);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) nameInputRef.current.focus();
  }, [isEditingName]);
  
  useEffect(() => {
    if (isEditingRole && roleInputRef.current) roleInputRef.current.focus();
  }, [isEditingRole]);
  
  useEffect(() => {
    if (isEditingEmail && emailInputRef.current) emailInputRef.current.focus();
  }, [isEditingEmail]);

  const manager = person.reportsTo ? getPersonById(person.reportsTo) : null;
  const directReports = getDirectReports(person.id);
  const teams = getTeamList();
  const currentTeam = state.teams[person.teamId];
  
  // Save handlers
  const saveName = () => {
    if (editName.trim() && editName !== person.name) {
      updatePerson(person.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };
  
  const saveRole = () => {
    if (editRole.trim() && editRole !== person.role) {
      updatePerson(person.id, { role: editRole.trim() });
    }
    setIsEditingRole(false);
  };
  
  const saveEmail = () => {
    const newEmail = editEmail.trim() || undefined;
    if (newEmail !== person.email) {
      updatePerson(person.id, { email: newEmail });
    }
    setIsEditingEmail(false);
  };
  
  const handleLevelChange = (newLevel: RoleLevel) => {
    if (newLevel !== person.level) {
      updatePerson(person.id, { level: newLevel });
    }
    setEditLevel(newLevel);
    setIsEditingLevel(false);
  };
  
  // Get initials for avatar
  const initials = person.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDelete = () => {
    if (confirmDelete) {
      deletePerson(person.id);
      onClose();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleTeamChange = (newTeamId: string) => {
    if (newTeamId !== person.teamId) {
      movePerson(person.id, person.teamId, newTeamId);
    }
    setIsEditingTeam(false);
  };

  const potentialManagers = Object.values(state.people).filter(p => 
    p.id !== person.id && p.level !== 'ic'
  );

  return (
    <div className="person-detail-overlay" onClick={onClose}>
      <div className="person-detail-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Profile */}
        <div className="detail-profile">
          <div className="detail-avatar">{initials}</div>
          
          {/* Editable Name */}
          {isEditingName ? (
            <div className="editable-field">
              <input
                ref={nameInputRef}
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') {
                    setEditName(person.name);
                    setIsEditingName(false);
                  }
                }}
                className="edit-name-input"
              />
            </div>
          ) : (
            <h2 
              className="detail-name editable" 
              onClick={() => setIsEditingName(true)}
              title="Click to edit name"
            >
              {person.name}
              <Pencil size={14} className="edit-icon" />
            </h2>
          )}
          
          {/* Editable Role */}
          {isEditingRole ? (
            <div className="editable-field">
              <input
                ref={roleInputRef}
                type="text"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                onBlur={saveRole}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveRole();
                  if (e.key === 'Escape') {
                    setEditRole(person.role);
                    setIsEditingRole(false);
                  }
                }}
                className="edit-role-input"
              />
            </div>
          ) : (
            <p 
              className="detail-role editable" 
              onClick={() => setIsEditingRole(true)}
              title="Click to edit role"
            >
              {person.role}
              <Pencil size={12} className="edit-icon" />
            </p>
          )}
          
          {/* Editable Level */}
          <div className="detail-meta">
            {isEditingLevel ? (
              <select
                value={editLevel}
                onChange={e => handleLevelChange(e.target.value as RoleLevel)}
                onBlur={() => setIsEditingLevel(false)}
                autoFocus
                className="edit-level-select"
              >
                {levelOptions.map(level => (
                  <option key={level} value={level}>
                    {levelLabels[level]}
                  </option>
                ))}
              </select>
            ) : (
              <span 
                className="meta-badge editable" 
                onClick={() => setIsEditingLevel(true)}
                title="Click to change level"
              >
                {levelLabels[person.level]}
                <Pencil size={10} className="edit-icon" />
              </span>
            )}
          </div>

          {/* Editable Email */}
          {isEditingEmail ? (
            <div className="editable-field email-field">
              <Mail size={14} />
              <input
                ref={emailInputRef}
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                onBlur={saveEmail}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEmail();
                  if (e.key === 'Escape') {
                    setEditEmail(person.email || '');
                    setIsEditingEmail(false);
                  }
                }}
                placeholder="Add email..."
                className="edit-email-input"
              />
            </div>
          ) : (
            <button 
              className="detail-email editable"
              onClick={() => setIsEditingEmail(true)}
              title="Click to edit email"
            >
              <Mail size={14} />
              {person.email || 'Add email...'}
              <Pencil size={12} className="edit-icon" />
            </button>
          )}
        </div>

        {/* Team section */}
        <div className="detail-section">
          <h4>Team</h4>
          {isEditingTeam ? (
            <div className="team-selector">
              <select
                value={person.teamId}
                onChange={e => handleTeamChange(e.target.value)}
                autoFocus
                onBlur={() => setIsEditingTeam(false)}
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button 
              className="team-display"
              onClick={() => setIsEditingTeam(true)}
            >
              <span className="team-name">{currentTeam?.name || 'Unknown'}</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        {/* Tags section */}
        <div className="detail-section">
          <h4>Tags</h4>
          <div className="detail-tags">
            {(Object.keys(tagConfig) as PersonTag[]).map(tag => {
              const config = tagConfig[tag];
              const Icon = config.icon;
              const isActive = person.tags.includes(tag);
              return (
                <button
                  key={tag}
                  className={`detail-tag ${isActive ? 'active' : ''}`}
                  style={{
                    borderColor: isActive ? config.color : 'transparent',
                    background: isActive ? `${config.color}15` : 'transparent',
                  }}
                  onClick={() => toggleTag(person.id, tag)}
                >
                  <Icon size={14} color={isActive ? config.color : '#64748b'} />
                  <span style={{ color: isActive ? config.color : '#94a3b8' }}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reporting structure */}
        <div className="detail-section">
          <h4>Reports To</h4>
          {isEditingManager ? (
            <div className="manager-selector">
              <select
                value={person.reportsTo || ''}
                onChange={e => {
                  setReportsTo(person.id, e.target.value || undefined);
                  setIsEditingManager(false);
                }}
                autoFocus
              >
                <option value="">No manager</option>
                {potentialManagers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
              <button onClick={() => setIsEditingManager(false)}>
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="manager-display"
              onClick={() => setIsEditingManager(true)}
            >
              {manager ? (
                <>
                  <span className="manager-name">{manager.name}</span>
                  <span className="manager-role">{manager.role}</span>
                </>
              ) : (
                <span className="no-manager">Click to assign manager</span>
              )}
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Direct reports */}
        {directReports.length > 0 && (
          <div className="detail-section">
            <h4>Direct Reports ({directReports.length})</h4>
            <div className="direct-reports-list">
              {directReports.map(report => (
                <div key={report.id} className="direct-report-item">
                  <span className="report-name">{report.name}</span>
                  <span className="report-role">{report.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete action */}
        <div className="detail-actions">
          <button 
            className={`delete-btn ${confirmDelete ? 'confirm' : ''}`}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            {confirmDelete ? 'Click again to confirm' : 'Remove from org'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AddPersonModal Component
 * 
 * Quick form for adding new contacts to the org.
 * Designed for speed - minimal required fields, smart defaults.
 */

import { useState, useEffect, useRef } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { TeamId, RoleLevel, PersonTag } from '../types';
import { useOrg } from '../context/OrgContext';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTeam?: TeamId;
}

const levelOptions: { value: RoleLevel; label: string }[] = [
  { value: 'executive', label: 'Executive (C-level)' },
  { value: 'vp', label: 'VP' },
  { value: 'director', label: 'Director' },
  { value: 'manager', label: 'Manager' },
  { value: 'ic', label: 'Individual Contributor' },
];

const tagOptions: { value: PersonTag; label: string }[] = [
  { value: 'power-user', label: 'Power User' },
  { value: 'champion', label: 'Champion' },
  { value: 'decision-maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'blocker', label: 'Blocker' },
];

export function AddPersonModal({ isOpen, onClose, defaultTeam }: AddPersonModalProps) {
  const { addPerson, getTeamList, state } = useOrg();
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Get dynamic team list
  const teams = getTeamList();
  const firstTeamId = teams.length > 0 ? teams[0].id : '';

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    teamId: defaultTeam || firstTeamId,
    level: 'ic' as RoleLevel,
    tags: [] as PersonTag[],
    reportsTo: '' as string,
  });

  // Reset form and focus on name input when modal opens
  useEffect(() => {
    if (isOpen) {
      const teamId = defaultTeam || firstTeamId;
      setFormData({
        name: '',
        role: '',
        email: '',
        teamId,
        level: 'ic',
        tags: [],
        reportsTo: '',
      });
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
    // Only reset when modal opens or defaultTeam changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultTeam]);

  // Get potential managers (people at a higher level in the same team or execs)
  const potentialManagers = Object.values(state.people).filter(p => {
    // Can't report to yourself
    if (p.teamId === formData.teamId || p.level === 'executive' || p.level === 'vp') {
      return true;
    }
    return false;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.teamId) return;

    addPerson({
      name: formData.name.trim(),
      role: formData.role.trim() || 'Team Member', // Default role if not provided
      email: formData.email.trim(),
      teamId: formData.teamId,
      level: formData.level,
      tags: formData.tags,
      reportsTo: formData.reportsTo || undefined,
    });

    onClose();
  };

  const toggleTag = (tag: PersonTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <UserPlus size={20} />
            <h2>Add Contact</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-person-form">
          {/* Name - Required */}
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Sarah Chen"
              required
            />
          </div>

          {/* Email - Required */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@company.com"
              required
            />
          </div>

          {/* Role - Optional */}
          <div className="form-group">
            <label htmlFor="role">Role / Title</label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="e.g. VP of Product"
            />
          </div>

          {/* Team & Level row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="team">Team *</label>
              <select
                id="team"
                value={formData.teamId}
                onChange={e => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                required
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                value={formData.level}
                onChange={e => setFormData(prev => ({ ...prev, level: e.target.value as RoleLevel }))}
              >
                {levelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reports To - Optional */}
          <div className="form-group">
            <label htmlFor="reportsTo">Reports To</label>
            <select
              id="reportsTo"
              value={formData.reportsTo}
              onChange={e => setFormData(prev => ({ ...prev, reportsTo: e.target.value }))}
            >
              <option value="">-- Select Manager --</option>
              {potentialManagers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tag-selector">
              {tagOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`tag-option ${formData.tags.includes(opt.value) ? 'selected' : ''}`}
                  onClick={() => toggleTag(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

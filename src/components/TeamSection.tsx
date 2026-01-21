/**
 * TeamSection Component
 * 
 * A droppable container representing a functional area (Product, Engineering, etc.)
 * Contains person cards and serves as a drop target for drag-and-drop.
 * Team name is editable inline.
 */

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Users, Check, X, Trash2, BarChart3, FlaskConical, Video, MessageSquare } from 'lucide-react';
import type { Team, Person, AmplitudeProduct } from '../types';
import { PersonCard } from './PersonCard';
import { useOrg } from '../context/OrgContext';

// Product config with icons and labels
const productConfig: Record<AmplitudeProduct, { icon: typeof BarChart3; label: string; color: string }> = {
  'analytics': { icon: BarChart3, label: 'Analytics', color: '#00d9ff' },
  'experiment': { icon: FlaskConical, label: 'Experiment', color: '#a855f7' },
  'session-replay': { icon: Video, label: 'Session Replay', color: '#22c55e' },
  'guides-surveys': { icon: MessageSquare, label: 'Guides & Surveys', color: '#f97316' },
};

interface TeamSectionProps {
  team: Team;
  people: Person[];
  onAddPerson: () => void;
  onSelectPerson: (person: Person) => void;
}

// Sort people by level hierarchy
const levelOrder = ['executive', 'vp', 'director', 'manager', 'ic'];

export function TeamSection({ 
  team, 
  people, 
  onAddPerson, 
  onSelectPerson
}: TeamSectionProps) {
  const { renameTeam, deleteTeam, toggleTeamProduct, state } = useOrg();
  const orgProducts = state.orgProducts || [];
  const teamProducts = team.products || [];
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sort people by seniority
  const sortedPeople = [...people].sort(
    (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  );

  const personIds = sortedPeople.map(p => p.id);

  const handleStartEdit = () => {
    setEditName(team.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== team.name) {
      renameTeam(team.id, trimmedName);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(team.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDeleteTeam = () => {
    deleteTeam(team.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      ref={setNodeRef}
      className={`team-section ${isOver ? 'drop-active' : ''}`}
      style={{
        '--team-color': team.color,
      } as React.CSSProperties}
    >
      {/* Team header */}
      <div className="team-header">
        <div className="team-title">
          {isEditing ? (
            <div className="team-name-edit">
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="team-name-input"
              />
              <button className="edit-btn save" onClick={handleSave} title="Save">
                <Check size={14} />
              </button>
              <button className="edit-btn cancel" onClick={handleCancel} title="Cancel">
                <X size={14} />
              </button>
            </div>
          ) : (
            <h3 
              className="team-name-display" 
              onClick={handleStartEdit}
              title="Click to rename"
            >
              {team.name}
            </h3>
          )}
          <span className="team-count">
            <Users size={14} />
            {people.length}
          </span>
        </div>
        <div className="team-actions">
          <button 
            className="add-person-btn"
            onClick={onAddPerson}
            title={`Add person to ${team.name}`}
          >
            <Plus size={16} />
          </button>
          <button 
            className="delete-team-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete team"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="delete-confirm-banner">
          <span>Delete "{team.name}"? {people.length > 0 && `(${people.length} people will be unassigned)`}</span>
          <div className="confirm-actions">
            <button className="btn-confirm-delete" onClick={handleDeleteTeam}>Delete</button>
            <button className="btn-cancel-delete" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Product badges - only show if org has any products */}
      {orgProducts.length > 0 && (
        <div className="team-products">
          {(Object.keys(productConfig) as AmplitudeProduct[]).map(product => {
            const config = productConfig[product];
            const Icon = config.icon;
            const hasOrgAccess = orgProducts.includes(product);
            const isActive = teamProducts.includes(product);
            
            if (!hasOrgAccess) return null;
            
            return (
              <button
                key={product}
                className={`product-badge ${isActive ? 'active' : ''}`}
                onClick={() => toggleTeamProduct(team.id, product)}
                data-tooltip={`${config.label}: ${isActive ? '✓ Onboarded' : '✗ Not onboarded'}`}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      )}

      {/* People list */}
      <SortableContext items={personIds} strategy={verticalListSortingStrategy}>
        <div className="team-people">
          {sortedPeople.length === 0 ? (
            <div className="empty-team">
              <p>No team members yet</p>
              <button onClick={onAddPerson}>Add someone</button>
            </div>
          ) : (
            sortedPeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onSelect={onSelectPerson}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Drop indicator */}
      {isOver && (
        <div className="drop-indicator">
          <span>Drop here to move</span>
        </div>
      )}
    </div>
  );
}

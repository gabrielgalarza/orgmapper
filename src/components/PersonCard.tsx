/**
 * PersonCard Component
 * 
 * Displays an individual contact with:
 * - Name, role, and level indicator
 * - Tags (power user, champion, etc.)
 * - Reporting relationship indicator
 * - Drag handle for reorganization
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Crown, 
  Star, 
  Zap, 
  Users, 
  AlertTriangle,
  GripVertical,
  ChevronRight,
  Mail
} from 'lucide-react';
import type { Person, PersonTag, RoleLevel } from '../types';
import { useOrg } from '../context/OrgContext';

interface PersonCardProps {
  person: Person;
  isCompact?: boolean;
  onSelect?: (person: Person) => void;
}

// Tag icon and color mappings for visual distinction
const tagConfig: Record<PersonTag, { icon: typeof Star; color: string; label: string }> = {
  'power-user': { icon: Zap, color: '#fbbf24', label: 'Power User' },
  'champion': { icon: Star, color: '#34d399', label: 'Champion' },
  'decision-maker': { icon: Crown, color: '#a78bfa', label: 'Decision Maker' },
  'influencer': { icon: Users, color: '#60a5fa', label: 'Influencer' },
  'blocker': { icon: AlertTriangle, color: '#f87171', label: 'Blocker' },
};

// Level styling for visual hierarchy
const levelConfig: Record<RoleLevel, { bg: string; border: string }> = {
  executive: { bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.4)' },
  vp: { bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.4)' },
  director: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.4)' },
  manager: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)' },
  ic: { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' },
};

export function PersonCard({ person, isCompact = false, onSelect }: PersonCardProps) {
  const { getPersonById } = useOrg();
  const manager = person.reportsTo ? getPersonById(person.reportsTo) : null;

  // dnd-kit sortable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: person.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const levelStyle = levelConfig[person.level];

  // Generate initials for avatar
  const initials = person.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isCompact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`person-card-compact ${isDragging ? 'dragging' : ''}`}
        onClick={() => onSelect?.(person)}
      >
        <div className="drag-handle" {...attributes} {...listeners}>
          <GripVertical size={14} />
        </div>
        <div className="avatar-small">{initials}</div>
        <span className="name-compact">{person.name}</span>
        {person.tags.length > 0 && (
          <div className="tags-compact">
            {person.tags.slice(0, 2).map(tag => {
              const config = tagConfig[tag];
              const Icon = config.icon;
              return <Icon key={tag} size={12} color={config.color} />;
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: levelStyle.bg,
        borderColor: levelStyle.border,
      }}
      className={`person-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => onSelect?.(person)}
    >
      {/* Drag handle */}
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>

      {/* Avatar */}
      <div className="avatar" style={{ borderColor: levelStyle.border }}>
        {initials}
      </div>

      {/* Main info */}
      <div className="person-info">
        <h4 className="person-name">{person.name}</h4>
        <p className="person-role">{person.role}</p>
        
        {/* Reporting line indicator */}
        {manager && (
          <div className="reports-to">
            <ChevronRight size={12} />
            <span>{manager.name}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {person.tags.length > 0 && (
        <div className="person-tags">
          {person.tags.map(tag => {
            const config = tagConfig[tag];
            const Icon = config.icon;
            return (
              <span 
                key={tag} 
                className="tag"
                style={{ 
                  background: `${config.color}20`,
                  color: config.color,
                }}
                title={config.label}
              >
                <Icon size={12} />
              </span>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      {person.email && (
        <a 
          href={`mailto:${person.email}`} 
          className="email-action"
          onClick={e => e.stopPropagation()}
          title={person.email}
        >
          <Mail size={14} />
        </a>
      )}
    </div>
  );
}

/**
 * OrgBoard Component
 * 
 * Main board view showing all teams and their members.
 * Handles drag-and-drop coordination between team sections.
 */

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Plus, Check, X } from 'lucide-react';
import type { TeamId, Person } from '../types';
import { useOrg } from '../context/OrgContext';
import { TeamSection } from './TeamSection';
import { PersonCard } from './PersonCard';
import { AddPersonModal } from './AddPersonModal';
import { PersonDetail } from './PersonDetail';

export function OrgBoard() {
  const { movePerson, getPeopleByTeam, getPersonById, getTeamList, addTeam } = useOrg();
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTeam, setAddModalTeam] = useState<TeamId | undefined>();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  // New team creation
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Drag state
  const [activePersonId, setActivePersonId] = useState<string | null>(null);

  // Get dynamic team list
  const teams = getTeamList();
  const teamIds = teams.map(t => t.id);

  // Configure drag sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActivePersonId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePersonId(null);

    if (!over) return;

    const personId = active.id as string;
    const person = getPersonById(personId);
    if (!person) return;

    // Check if dropped on a team (the team ID)
    const overId = over.id as string;
    
    // If dropped on another person, get their team
    const overPerson = getPersonById(overId);
    const targetTeam = overPerson?.teamId ?? overId;

    // Only move if target is a valid team
    if (teamIds.includes(targetTeam) && targetTeam !== person.teamId) {
      movePerson(personId, person.teamId, targetTeam);
    }
  };

  const handleAddPerson = (teamId?: TeamId) => {
    setAddModalTeam(teamId);
    setIsAddModalOpen(true);
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName('');
      setIsCreatingTeam(false);
    }
  };

  const activePerson = activePersonId ? getPersonById(activePersonId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="org-board">
        {/* Main team grid */}
        <div className="teams-grid">
          {teams.map(team => (
            <TeamSection
              key={team.id}
              team={team}
              people={getPeopleByTeam(team.id)}
              onAddPerson={() => handleAddPerson(team.id)}
              onSelectPerson={handleSelectPerson}
            />
          ))}
          
          {/* Add new team card */}
          <div className="add-team-card">
            {isCreatingTeam ? (
              <div className="add-team-form">
                <input
                  type="text"
                  placeholder="Team name..."
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateTeam();
                    if (e.key === 'Escape') {
                      setIsCreatingTeam(false);
                      setNewTeamName('');
                    }
                  }}
                  autoFocus
                />
                <div className="add-team-actions">
                  <button 
                    className="add-team-btn-confirm"
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim()}
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    className="add-team-btn-cancel"
                    onClick={() => {
                      setIsCreatingTeam(false);
                      setNewTeamName('');
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="add-team-trigger"
                onClick={() => setIsCreatingTeam(true)}
              >
                <Plus size={20} />
                <span>Add Team</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay - shows the card being dragged */}
      <DragOverlay>
        {activePerson && (
          <div className="drag-overlay-card">
            <PersonCard person={activePerson} />
          </div>
        )}
      </DragOverlay>

      {/* Add person modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultTeam={addModalTeam}
      />

      {/* Person detail panel */}
      {selectedPerson && (
        <PersonDetail
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </DndContext>
  );
}

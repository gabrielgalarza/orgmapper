/**
 * Core types for the org mapping tool
 * 
 * Design decisions:
 * - Keep types minimal but expressive
 * - Use string for team IDs to allow custom teams
 * - Separate concerns: Person exists independent of Team placement
 */

// Team IDs are now dynamic strings (user can create custom teams)
export type TeamId = string;

export type RoleLevel = 
  | 'executive' 
  | 'vp' 
  | 'director' 
  | 'manager' 
  | 'ic';

export type PersonTag = 
  | 'power-user' 
  | 'champion' 
  | 'decision-maker' 
  | 'influencer' 
  | 'blocker';

// Amplitude product types
export type AmplitudeProduct = 
  | 'analytics'
  | 'experiment'
  | 'session-replay'
  | 'guides-surveys';

export interface Person {
  id: string;
  name: string;
  role: string;
  level: RoleLevel;
  email?: string;
  avatar?: string;
  tags: PersonTag[];
  reportsTo?: string; // Person ID
  teamId: TeamId;
}

export interface Team {
  id: TeamId;
  name: string;
  color: string;
  personIds: string[];
  products: AmplitudeProduct[]; // Which Amplitude products this team has onboarded
}

export interface OrgState {
  teams: Record<TeamId, Team>;
  people: Record<string, Person>;
  orgProducts: AmplitudeProduct[]; // Which Amplitude products this org has access to
}

// UI State for drag operations
export interface DragState {
  activePersonId: string | null;
  overTeamId: TeamId | null;
}

// Legacy type alias for backwards compatibility
export type TeamType = TeamId;

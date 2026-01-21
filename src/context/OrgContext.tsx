/**
 * Global state management for the org mapper
 * 
 * Uses React Context with useReducer for predictable state updates.
 * Includes localStorage persistence for saving org data across sessions.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { OrgState, Person, TeamId, PersonTag, Team, AmplitudeProduct } from '../types';
import { initialOrgState, generateId, createEmptyOrgState } from '../data/mockData';

// Storage keys
const STORAGE_KEY = 'orgmapper_data';
const CURRENT_ORG_KEY = 'orgmapper_current';
const ORGS_LIST_KEY = 'orgmapper_orgs';

// Saved org metadata
export interface SavedOrg {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Action types for state management
type OrgAction =
  | { type: 'MOVE_PERSON'; personId: string; fromTeam: TeamId; toTeam: TeamId }
  | { type: 'ADD_PERSON'; person: Omit<Person, 'id'> }
  | { type: 'UPDATE_PERSON'; personId: string; updates: Partial<Person> }
  | { type: 'DELETE_PERSON'; personId: string }
  | { type: 'SET_REPORTS_TO'; personId: string; managerId: string | undefined }
  | { type: 'TOGGLE_TAG'; personId: string; tag: PersonTag }
  | { type: 'RENAME_TEAM'; teamId: TeamId; newName: string }
  | { type: 'ADD_TEAM'; team: Team }
  | { type: 'DELETE_TEAM'; teamId: TeamId }
  | { type: 'TOGGLE_TEAM_PRODUCT'; teamId: TeamId; product: AmplitudeProduct }
  | { type: 'TOGGLE_ORG_PRODUCT'; product: AmplitudeProduct }
  | { type: 'LOAD_ORG'; state: OrgState }
  | { type: 'CLEAR_ORG' };

// Context interface
interface OrgContextType {
  state: OrgState;
  dispatch: React.Dispatch<OrgAction>;
  movePerson: (personId: string, fromTeam: TeamId, toTeam: TeamId) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  deletePerson: (personId: string) => void;
  setReportsTo: (personId: string, managerId: string | undefined) => void;
  toggleTag: (personId: string, tag: PersonTag) => void;
  renameTeam: (teamId: TeamId, newName: string) => void;
  addTeam: (name: string) => void;
  deleteTeam: (teamId: TeamId) => void;
  toggleTeamProduct: (teamId: TeamId, product: AmplitudeProduct) => void;
  toggleOrgProduct: (product: AmplitudeProduct) => void;
  getPersonById: (id: string) => Person | undefined;
  getPeopleByTeam: (teamId: TeamId) => Person[];
  getDirectReports: (managerId: string) => Person[];
  getTeamList: () => Team[];
  // Persistence
  currentOrgId: string;
  currentOrgName: string;
  savedOrgs: SavedOrg[];
  loadOrg: (orgId: string) => void;
  createNewOrg: (name: string) => void;
  deleteOrg: (orgId: string) => void;
  renameOrg: (orgId: string, newName: string) => void;
  exportOrg: () => string;
  importOrg: (jsonData: string, name: string) => void;
  importSharedOrg: (state: OrgState, name: string) => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

// Storage helpers with error handling
function loadFromStorage(orgId: string): OrgState | null {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${orgId}`);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // Validate structure
    if (parsed && parsed.teams && parsed.people) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error('Failed to load org data:', e);
    return null;
  }
}

function saveToStorage(orgId: string, state: OrgState): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${orgId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save org data:', e);
  }
}

function loadOrgsList(): SavedOrg[] {
  try {
    const data = localStorage.getItem(ORGS_LIST_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load orgs list:', e);
    return [];
  }
}

function saveOrgsList(orgs: SavedOrg[]): void {
  try {
    localStorage.setItem(ORGS_LIST_KEY, JSON.stringify(orgs));
  } catch (e) {
    console.error('Failed to save orgs list:', e);
  }
}

function getCurrentOrgId(): string | null {
  try {
    return localStorage.getItem(CURRENT_ORG_KEY);
  } catch {
    return null;
  }
}

function setCurrentOrgId(orgId: string): void {
  try {
    localStorage.setItem(CURRENT_ORG_KEY, orgId);
  } catch (e) {
    console.error('Failed to set current org:', e);
  }
}

// Reducer
function orgReducer(state: OrgState, action: OrgAction): OrgState {
  switch (action.type) {
    case 'MOVE_PERSON': {
      const { personId, fromTeam, toTeam } = action;
      if (fromTeam === toTeam) return state;

      const newTeams = { ...state.teams };
      newTeams[fromTeam] = {
        ...newTeams[fromTeam],
        personIds: newTeams[fromTeam].personIds.filter(id => id !== personId),
      };
      newTeams[toTeam] = {
        ...newTeams[toTeam],
        personIds: [...newTeams[toTeam].personIds, personId],
      };

      return {
        ...state,
        teams: newTeams,
        people: {
          ...state.people,
          [personId]: { ...state.people[personId], teamId: toTeam },
        },
      };
    }

    case 'ADD_PERSON': {
      const id = generateId();
      const newPerson: Person = { ...action.person, id };
      
      const newTeams = { ...state.teams };
      newTeams[action.person.teamId] = {
        ...newTeams[action.person.teamId],
        personIds: [...newTeams[action.person.teamId].personIds, id],
      };

      return {
        ...state,
        teams: newTeams,
        people: { ...state.people, [id]: newPerson },
      };
    }

    case 'UPDATE_PERSON': {
      const { personId, updates } = action;
      const currentPerson = state.people[personId];
      if (!currentPerson) return state;

      if (updates.teamId && updates.teamId !== currentPerson.teamId) {
        const newTeams = { ...state.teams };
        newTeams[currentPerson.teamId] = {
          ...newTeams[currentPerson.teamId],
          personIds: newTeams[currentPerson.teamId].personIds.filter(id => id !== personId),
        };
        newTeams[updates.teamId] = {
          ...newTeams[updates.teamId],
          personIds: [...newTeams[updates.teamId].personIds, personId],
        };

        return {
          ...state,
          teams: newTeams,
          people: { ...state.people, [personId]: { ...currentPerson, ...updates } },
        };
      }

      return {
        ...state,
        people: { ...state.people, [personId]: { ...currentPerson, ...updates } },
      };
    }

    case 'DELETE_PERSON': {
      const { personId } = action;
      const person = state.people[personId];
      if (!person) return state;

      const newTeams = { ...state.teams };
      newTeams[person.teamId] = {
        ...newTeams[person.teamId],
        personIds: newTeams[person.teamId].personIds.filter(id => id !== personId),
      };

      const newPeople = { ...state.people };
      delete newPeople[personId];
      
      Object.keys(newPeople).forEach(id => {
        if (newPeople[id].reportsTo === personId) {
          newPeople[id] = { ...newPeople[id], reportsTo: undefined };
        }
      });

      return { ...state, teams: newTeams, people: newPeople };
    }

    case 'SET_REPORTS_TO': {
      return {
        ...state,
        people: {
          ...state.people,
          [action.personId]: { ...state.people[action.personId], reportsTo: action.managerId },
        },
      };
    }

    case 'TOGGLE_TAG': {
      const person = state.people[action.personId];
      if (!person) return state;

      const newTags = person.tags.includes(action.tag)
        ? person.tags.filter(t => t !== action.tag)
        : [...person.tags, action.tag];

      return {
        ...state,
        people: { ...state.people, [action.personId]: { ...person, tags: newTags } },
      };
    }

    case 'RENAME_TEAM': {
      return {
        ...state,
        teams: {
          ...state.teams,
          [action.teamId]: { ...state.teams[action.teamId], name: action.newName },
        },
      };
    }

    case 'ADD_TEAM': {
      return {
        ...state,
        teams: {
          ...state.teams,
          [action.team.id]: action.team,
        },
      };
    }

    case 'DELETE_TEAM': {
      const { teamId } = action;
      const team = state.teams[teamId];
      if (!team) return state;
      
      // Don't delete if it has people
      if (team.personIds.length > 0) return state;
      
      const newTeams = { ...state.teams };
      delete newTeams[teamId];
      
      return { ...state, teams: newTeams };
    }

    case 'TOGGLE_TEAM_PRODUCT': {
      const { teamId, product } = action;
      const team = state.teams[teamId];
      if (!team) return state;
      
      // Can only add product if org has access
      const orgProducts = state.orgProducts || [];
      if (!orgProducts.includes(product) && !team.products?.includes(product)) {
        return state;
      }
      
      const currentProducts = team.products || [];
      const newProducts = currentProducts.includes(product)
        ? currentProducts.filter(p => p !== product)
        : [...currentProducts, product];
      
      return {
        ...state,
        teams: {
          ...state.teams,
          [teamId]: { ...team, products: newProducts },
        },
      };
    }

    case 'TOGGLE_ORG_PRODUCT': {
      const { product } = action;
      const currentProducts = state.orgProducts || [];
      const newOrgProducts = currentProducts.includes(product)
        ? currentProducts.filter(p => p !== product)
        : [...currentProducts, product];
      
      // If removing an org product, also remove from all teams
      if (!newOrgProducts.includes(product)) {
        const newTeams = { ...state.teams };
        Object.keys(newTeams).forEach(teamId => {
          const team = newTeams[teamId];
          if (team.products?.includes(product)) {
            newTeams[teamId] = {
              ...team,
              products: team.products.filter(p => p !== product),
            };
          }
        });
        return { ...state, teams: newTeams, orgProducts: newOrgProducts };
      }
      
      return { ...state, orgProducts: newOrgProducts };
    }

    case 'LOAD_ORG':
      return action.state;

    case 'CLEAR_ORG':
      return createEmptyOrgState();

    default:
      return state;
  }
}

// Get initial data with fallbacks
function getInitialData(): { orgs: SavedOrg[]; currentId: string; initialState: OrgState } {
  let orgs = loadOrgsList();
  let currentId = getCurrentOrgId();

  // If no orgs exist or corrupted, create default
  if (!orgs || orgs.length === 0) {
    const defaultOrg: SavedOrg = {
      id: 'default',
      name: 'Cisco (Sample)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orgs = [defaultOrg];
    saveOrgsList(orgs);
    saveToStorage('default', initialOrgState);
    currentId = 'default';
    setCurrentOrgId('default');
  }

  // Validate currentId
  if (!currentId || !orgs.find(o => o.id === currentId)) {
    currentId = orgs[0].id;
    setCurrentOrgId(currentId);
  }

  // Load state with fallback
  let initialState = loadFromStorage(currentId);
  if (!initialState) {
    initialState = initialOrgState;
    saveToStorage(currentId, initialState);
  }

  return { orgs, currentId, initialState };
}

// Provider component
export function OrgProvider({ children }: { children: ReactNode }) {
  // Get initial data once
  const initRef = useRef<{ orgs: SavedOrg[]; currentId: string; initialState: OrgState } | null>(null);
  if (!initRef.current) {
    initRef.current = getInitialData();
  }
  const initData = initRef.current;

  const [savedOrgs, setSavedOrgs] = useState<SavedOrg[]>(initData.orgs);
  const [currentOrgId, setCurrentOrgIdState] = useState<string>(initData.currentId);
  const [state, dispatch] = useReducer(orgReducer, initData.initialState);

  const currentOrgName = savedOrgs.find(o => o.id === currentOrgId)?.name || 'Untitled';

  // Auto-save with debounce
  const isFirstRender = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(currentOrgId, state);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, currentOrgId]);

  // Actions
  const movePerson = useCallback((personId: string, fromTeam: TeamId, toTeam: TeamId) => {
    dispatch({ type: 'MOVE_PERSON', personId, fromTeam, toTeam });
  }, []);

  const addPerson = useCallback((person: Omit<Person, 'id'>) => {
    dispatch({ type: 'ADD_PERSON', person });
  }, []);

  const updatePerson = useCallback((personId: string, updates: Partial<Person>) => {
    dispatch({ type: 'UPDATE_PERSON', personId, updates });
  }, []);

  const deletePerson = useCallback((personId: string) => {
    dispatch({ type: 'DELETE_PERSON', personId });
  }, []);

  const setReportsTo = useCallback((personId: string, managerId: string | undefined) => {
    dispatch({ type: 'SET_REPORTS_TO', personId, managerId });
  }, []);

  const toggleTag = useCallback((personId: string, tag: PersonTag) => {
    dispatch({ type: 'TOGGLE_TAG', personId, tag });
  }, []);

  const renameTeam = useCallback((teamId: TeamId, newName: string) => {
    dispatch({ type: 'RENAME_TEAM', teamId, newName });
  }, []);

  // Generate a random color for new teams
  const getRandomColor = () => {
    // Amplitude brand colors
    const colors = ['#001A4F', '#0052F2', '#6980FF', '#A373FF', '#FF7D78', '#F23845', '#50565B', '#373D42', '#242A2E'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addTeam = useCallback((name: string) => {
    const id = `team_${Date.now()}`;
    const team: Team = {
      id,
      name,
      color: getRandomColor(),
      personIds: [],
      products: [],
    };
    dispatch({ type: 'ADD_TEAM', team });
  }, []);

  const deleteTeam = useCallback((teamId: TeamId) => {
    dispatch({ type: 'DELETE_TEAM', teamId });
  }, []);

  const toggleTeamProduct = useCallback((teamId: TeamId, product: AmplitudeProduct) => {
    dispatch({ type: 'TOGGLE_TEAM_PRODUCT', teamId, product });
  }, []);

  const toggleOrgProduct = useCallback((product: AmplitudeProduct) => {
    dispatch({ type: 'TOGGLE_ORG_PRODUCT', product });
  }, []);

  const getPersonById = useCallback((id: string) => state.people[id], [state.people]);

  const getPeopleByTeam = useCallback((teamId: TeamId): Person[] => {
    const team = state.teams[teamId];
    if (!team) return [];
    return team.personIds.map(id => state.people[id]).filter(Boolean);
  }, [state.teams, state.people]);

  const getDirectReports = useCallback((managerId: string): Person[] => {
    return Object.values(state.people).filter(p => p.reportsTo === managerId);
  }, [state.people]);

  const getTeamList = useCallback((): Team[] => {
    return Object.values(state.teams);
  }, [state.teams]);

  // Persistence methods
  const loadOrg = useCallback((orgId: string) => {
    const orgState = loadFromStorage(orgId);
    if (orgState) {
      dispatch({ type: 'LOAD_ORG', state: orgState });
      setCurrentOrgIdState(orgId);
      setCurrentOrgId(orgId);
    }
  }, []);

  const createNewOrg = useCallback((name: string) => {
    const newId = `org_${Date.now()}`;
    const newOrg: SavedOrg = {
      id: newId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const emptyState = createEmptyOrgState();
    saveToStorage(newId, emptyState);
    
    const updatedOrgs = [...savedOrgs, newOrg];
    setSavedOrgs(updatedOrgs);
    saveOrgsList(updatedOrgs);
    
    dispatch({ type: 'LOAD_ORG', state: emptyState });
    setCurrentOrgIdState(newId);
    setCurrentOrgId(newId);
  }, [savedOrgs]);

  const deleteOrg = useCallback((orgId: string) => {
    if (savedOrgs.length <= 1) return;
    
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${orgId}`);
    } catch {}
    
    const updatedOrgs = savedOrgs.filter(o => o.id !== orgId);
    setSavedOrgs(updatedOrgs);
    saveOrgsList(updatedOrgs);
    
    if (currentOrgId === orgId) {
      loadOrg(updatedOrgs[0].id);
    }
  }, [savedOrgs, currentOrgId, loadOrg]);

  const renameOrg = useCallback((orgId: string, newName: string) => {
    const updatedOrgs = savedOrgs.map(org =>
      org.id === orgId ? { ...org, name: newName } : org
    );
    setSavedOrgs(updatedOrgs);
    saveOrgsList(updatedOrgs);
  }, [savedOrgs]);

  const exportOrg = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importOrg = useCallback((jsonData: string, name: string) => {
    const importedState = JSON.parse(jsonData) as OrgState;
    if (!importedState.teams || !importedState.people) {
      throw new Error('Invalid org data');
    }
    
    const newId = `org_${Date.now()}`;
    const newOrg: SavedOrg = {
      id: newId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(newId, importedState);
    
    const updatedOrgs = [...savedOrgs, newOrg];
    setSavedOrgs(updatedOrgs);
    saveOrgsList(updatedOrgs);
    
    dispatch({ type: 'LOAD_ORG', state: importedState });
    setCurrentOrgIdState(newId);
    setCurrentOrgId(newId);
  }, [savedOrgs]);

  // Import from a shared URL (state already parsed)
  const importSharedOrg = useCallback((sharedState: OrgState, name: string) => {
    if (!sharedState.teams || !sharedState.people) {
      console.error('Invalid shared org data');
      return;
    }
    
    const newId = `shared_${Date.now()}`;
    const newOrg: SavedOrg = {
      id: newId,
      name: `${name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(newId, sharedState);
    
    const updatedOrgs = [...savedOrgs, newOrg];
    setSavedOrgs(updatedOrgs);
    saveOrgsList(updatedOrgs);
    
    dispatch({ type: 'LOAD_ORG', state: sharedState });
    setCurrentOrgIdState(newId);
    setCurrentOrgId(newId);
  }, [savedOrgs]);

  const value: OrgContextType = {
    state,
    dispatch,
    movePerson,
    addPerson,
    updatePerson,
    deletePerson,
    setReportsTo,
    toggleTag,
    renameTeam,
    addTeam,
    deleteTeam,
    toggleTeamProduct,
    toggleOrgProduct,
    getPersonById,
    getPeopleByTeam,
    getDirectReports,
    getTeamList,
    currentOrgId,
    currentOrgName,
    savedOrgs,
    loadOrg,
    createNewOrg,
    deleteOrg,
    renameOrg,
    exportOrg,
    importOrg,
    importSharedOrg,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within OrgProvider');
  }
  return context;
}

/**
 * Mock data representing a sample enterprise org (Cisco-style)
 * 
 * This provides realistic data for demonstrating the tool's capabilities
 */

import type { OrgState, TeamType, Team, Person, AmplitudeProduct } from '../types';

// Team definitions with distinctive colors
const teams: Record<TeamType, Team> = {
  executive: {
    id: 'executive',
    name: 'Executive',
    color: '#1a1a2e',
    personIds: ['p1'],
    products: [],
  },
  product: {
    id: 'product',
    name: 'Product',
    color: '#16213e',
    personIds: ['p2', 'p3', 'p4'],
    products: ['analytics', 'experiment', 'session-replay'],
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering',
    color: '#0f3460',
    personIds: ['p5', 'p6', 'p7', 'p8'],
    products: ['analytics', 'session-replay'],
  },
  'data-science': {
    id: 'data-science',
    name: 'Data Science',
    color: '#1a1a40',
    personIds: ['p9', 'p10'],
    products: ['analytics', 'experiment'],
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    color: '#2d132c',
    personIds: ['p11', 'p12'],
    products: [],
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    color: '#1e1e2f',
    personIds: ['p13'],
    products: ['analytics', 'guides-surveys'],
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    color: '#252836',
    personIds: ['p14'],
    products: [],
  },
};

const people: Record<string, Person> = {
  p1: {
    id: 'p1',
    name: 'Sarah Chen',
    role: 'Chief Technology Officer',
    level: 'executive',
    email: 'sarah.chen@cisco.com',
    tags: ['decision-maker'],
    teamId: 'executive',
  },
  p2: {
    id: 'p2',
    name: 'Marcus Williams',
    role: 'VP of Product',
    level: 'vp',
    email: 'marcus.w@cisco.com',
    tags: ['champion', 'decision-maker'],
    reportsTo: 'p1',
    teamId: 'product',
  },
  p3: {
    id: 'p3',
    name: 'Elena Rodriguez',
    role: 'Director of Product',
    level: 'director',
    email: 'elena.r@cisco.com',
    tags: ['power-user'],
    reportsTo: 'p2',
    teamId: 'product',
  },
  p4: {
    id: 'p4',
    name: 'James Park',
    role: 'Senior Product Manager',
    level: 'manager',
    email: 'james.p@cisco.com',
    tags: ['champion'],
    reportsTo: 'p3',
    teamId: 'product',
  },
  p5: {
    id: 'p5',
    name: 'Aisha Patel',
    role: 'VP of Engineering',
    level: 'vp',
    email: 'aisha.p@cisco.com',
    tags: ['decision-maker'],
    reportsTo: 'p1',
    teamId: 'engineering',
  },
  p6: {
    id: 'p6',
    name: 'David Kim',
    role: 'Engineering Director',
    level: 'director',
    email: 'david.k@cisco.com',
    tags: ['influencer'],
    reportsTo: 'p5',
    teamId: 'engineering',
  },
  p7: {
    id: 'p7',
    name: 'Lisa Chang',
    role: 'Staff Engineer',
    level: 'ic',
    email: 'lisa.c@cisco.com',
    tags: ['power-user', 'champion'],
    reportsTo: 'p6',
    teamId: 'engineering',
  },
  p8: {
    id: 'p8',
    name: 'Michael Torres',
    role: 'Senior Engineer',
    level: 'ic',
    email: 'michael.t@cisco.com',
    tags: [],
    reportsTo: 'p6',
    teamId: 'engineering',
  },
  p9: {
    id: 'p9',
    name: 'Priya Sharma',
    role: 'Director of Data Science',
    level: 'director',
    email: 'priya.s@cisco.com',
    tags: ['power-user', 'influencer'],
    reportsTo: 'p1',
    teamId: 'data-science',
  },
  p10: {
    id: 'p10',
    name: 'Alex Johnson',
    role: 'Senior Data Scientist',
    level: 'ic',
    email: 'alex.j@cisco.com',
    tags: ['champion'],
    reportsTo: 'p9',
    teamId: 'data-science',
  },
  p11: {
    id: 'p11',
    name: 'Rachel Green',
    role: 'VP of Sales',
    level: 'vp',
    email: 'rachel.g@cisco.com',
    tags: ['decision-maker'],
    reportsTo: 'p1',
    teamId: 'sales',
  },
  p12: {
    id: 'p12',
    name: 'Tom Anderson',
    role: 'Account Executive',
    level: 'ic',
    email: 'tom.a@cisco.com',
    tags: ['influencer'],
    reportsTo: 'p11',
    teamId: 'sales',
  },
  p13: {
    id: 'p13',
    name: 'Nina Foster',
    role: 'Marketing Director',
    level: 'director',
    email: 'nina.f@cisco.com',
    tags: [],
    reportsTo: 'p1',
    teamId: 'marketing',
  },
  p14: {
    id: 'p14',
    name: 'Chris Lee',
    role: 'Operations Manager',
    level: 'manager',
    email: 'chris.l@cisco.com',
    tags: ['blocker'],
    reportsTo: 'p1',
    teamId: 'operations',
  },
};

export const initialOrgState: OrgState = {
  teams,
  people,
  orgProducts: ['analytics', 'experiment', 'session-replay', 'guides-surveys'] as AmplitudeProduct[],
};

// Helper to generate unique IDs
export const generateId = (): string => {
  return `p${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create an empty org state (for new orgs)
export const createEmptyOrgState = (): OrgState => ({
  teams: {
    executive: { id: 'executive', name: 'Executive', color: '#1a1a2e', personIds: [], products: [] },
    product: { id: 'product', name: 'Product', color: '#16213e', personIds: [], products: [] },
    engineering: { id: 'engineering', name: 'Engineering', color: '#0f3460', personIds: [], products: [] },
    'data-science': { id: 'data-science', name: 'Data Science', color: '#1a1a40', personIds: [], products: [] },
    sales: { id: 'sales', name: 'Sales', color: '#2d132c', personIds: [], products: [] },
    marketing: { id: 'marketing', name: 'Marketing', color: '#1e1e2f', personIds: [], products: [] },
    operations: { id: 'operations', name: 'Operations', color: '#252836', personIds: [], products: [] },
  },
  people: {},
  orgProducts: [],
});

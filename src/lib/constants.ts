import type { LeadSource, LeadStatus } from '@/types/lead';
import type { RoleDefinition, RoleId, NavView } from '@/types/role';

// Ported verbatim from the original app.js so every label/color mapping
// stays pixel- and word-identical to the existing dashboard.
export const SOURCE_LABELS: Record<LeadSource, string> = {
  META_LEAD_ADS: 'Meta Lead Ads',
  GOOGLE_ADS: 'Google Ads',
  WEBSITE_FORM: 'Website Form',
  LANDING_PAGE: 'Landing Page',
  WHATSAPP: 'WhatsApp',
  CSV_IMPORT: 'CSV Import',
  MANUAL_ENTRY: 'Manual Entry',
};

export const SOURCE_COLORS: Record<LeadSource, string> = {
  META_LEAD_ADS: '#4f46e5',
  GOOGLE_ADS: '#f59e0b',
  WEBSITE_FORM: '#10b981',
  LANDING_PAGE: '#6366f1',
  WHATSAPP: '#10b981',
  CSV_IMPORT: '#6b7280',
  MANUAL_ENTRY: '#4b5563',
};

export const FUNNEL_STAGES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'WON',
];

export const STATUS_ORDER: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
];

export const ROLES: Record<RoleId, RoleDefinition> = {
  ADMIN: { id: 'ADMIN', label: 'Administrator', name: 'Admin User' },
  MANAGER: {
    id: 'MANAGER',
    label: 'Sales Manager',
    name: 'Priya Menon',
    team: ['Rahul K.', 'Sneha M.'],
  },
  SALES_EXEC: { id: 'SALES_EXEC', label: 'Sales Executive', name: 'Rahul K.' },
};

export const NAV_ROLE_MAP: Record<NavView, RoleId[]> = {
  dashboard: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  leads: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  campaigns: ['ADMIN', 'MANAGER'],
  analytics: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  integrations: ['ADMIN', 'MANAGER'],
  notifications: ['ADMIN', 'MANAGER', 'SALES_EXEC'],
  settings: ['ADMIN'],
};

export const OWNER_OPTIONS = ['Rahul K.', 'Sneha M.', 'Vikram T.', 'Ananya D.'];

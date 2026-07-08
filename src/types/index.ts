export type UserRole = 'ADMIN' | 'MANAGER' | 'SALES_EXEC';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadSource = 'META_LEAD_ADS' | 'GOOGLE_ADS' | 'WEBSITE_FORM' | 'LANDING_PAGE' | 'WHATSAPP' | 'CSV_IMPORT' | 'MANUAL_ENTRY';
export type HistoryEventType = 'CREATE' | 'UPDATE' | 'DELETE' | 'NOTE';
export type CampaignStatus = 'ACTIVE' | 'ENDED';

export interface Campaign {
  id: string;
  name: string;
  subtitle: string | null;
  status: CampaignStatus;
  spend: number;
  leads_gen: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface LeadHistory {
  id: string;
  lead_id: string;
  type: HistoryEventType;
  label: string;
  created_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  owner_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  owner?: Profile | null;
  history?: LeadHistory[];
}

// Map enum values to human readable labels
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
  LANDING_PAGE: '#818cf8',
  WHATSAPP: '#10b981',
  CSV_IMPORT: '#6b7280',
  MANUAL_ENTRY: '#9ca3af',
};

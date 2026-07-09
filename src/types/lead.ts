export type LeadSource =
  | 'META_LEAD_ADS'
  | 'GOOGLE_ADS'
  | 'WEBSITE_FORM'
  | 'LANDING_PAGE'
  | 'WHATSAPP'
  | 'CSV_IMPORT'
  | 'MANUAL_ENTRY';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export interface LeadHistoryEntry {
  type: 'CREATE' | 'UPDATE' | 'SYSTEM';
  label: string;
  time: string; // ISO timestamp
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  owner: string; // empty string = unassigned
  notes?: string;
  createdAt: string; // ISO timestamp
  history: LeadHistoryEntry[];
}

export type NewLeadInput = {
  firstName: string;
  lastName: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  owner: string;
};

export type LeadUpdateInput = Partial<
  Pick<Lead, 'status' | 'owner' | 'notes' | 'score'>
>;

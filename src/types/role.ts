export type RoleId = 'ADMIN' | 'MANAGER' | 'SALES_EXEC';

export interface RoleDefinition {
  id: RoleId;
  label: string;
  name: string; // demo identity's display name
  team?: string[]; // MANAGER only: the reps whose leads they can see
}

export type NavView =
  | 'dashboard'
  | 'leads'
  | 'campaigns'
  | 'analytics'
  | 'integrations'
  | 'notifications'
  | 'settings';

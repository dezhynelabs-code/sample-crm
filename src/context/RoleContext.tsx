import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { RoleId, NavView } from '@/types/role';
import type { Lead } from '@/types/lead';
import { ROLES, NAV_ROLE_MAP } from '@/lib/constants';

interface RoleContextValue {
  currentRole: RoleId;
  setCurrentRole: (role: RoleId) => void;
  roleDefinition: (typeof ROLES)[RoleId];
  canManageLead: (lead: Pick<Lead, 'owner'>) => boolean;
  isViewAllowed: (view: NavView) => boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<RoleId>(
    () => (localStorage.getItem('pipeline_role') as RoleId) || 'ADMIN',
  );

  useEffect(() => {
    localStorage.setItem('pipeline_role', currentRole);
  }, [currentRole]);

  function setCurrentRole(role: RoleId) {
    setCurrentRoleState(role);
  }

  // Row-level guard, ported from canManageLead() in the original app.js.
  // This is the real authorization boundary — the nav/UI gating below is
  // only ever a convenience layer on top of this.
  function canManageLead(lead: Pick<Lead, 'owner'>): boolean {
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'MANAGER') return (ROLES.MANAGER.team ?? []).includes(lead.owner);
    if (currentRole === 'SALES_EXEC') return lead.owner === ROLES.SALES_EXEC.name;
    return false;
  }

  function isViewAllowed(view: NavView): boolean {
    return NAV_ROLE_MAP[view]?.includes(currentRole) ?? false;
  }

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        roleDefinition: ROLES[currentRole],
        canManageLead,
        isViewAllowed,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}

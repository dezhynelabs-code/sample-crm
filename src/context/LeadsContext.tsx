import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lead, NewLeadInput, LeadUpdateInput } from '@/types/lead';
import { fetchLeads, insertLead, updateLeadRecord, deleteLeadRecord } from '@/lib/repositories/leadsRepository';
import { useRole } from './RoleContext';
import { useNotifications } from './NotificationsContext';
import { useToast } from './ToastContext';
import { ROLES } from '@/lib/constants';

interface LeadsContextValue {
  leads: Lead[];
  scopedLeads: Lead[]; // role-filtered — the set every view should render from
  loading: boolean;
  addLead: (input: NewLeadInput) => Promise<void>;
  updateLead: (id: string, updates: LeadUpdateInput) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextValue | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useRole();
  const { addSystemNotification } = useNotifications();
  const { showToast } = useToast();

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .finally(() => setLoading(false));
  }, []);

  // The single choke point every page/component reads leads through.
  // ADMIN sees everything, MANAGER sees their team, SALES_EXEC sees only
  // their own — enforced here at the data layer, not by hiding UI.
  // Ported from getScopedLeads() in the original app.js.
  const scopedLeads = useMemo(() => {
    if (currentRole === 'MANAGER') {
      const team = ROLES.MANAGER.team ?? [];
      return leads.filter((l) => team.includes(l.owner));
    }
    if (currentRole === 'SALES_EXEC') {
      return leads.filter((l) => l.owner === ROLES.SALES_EXEC.name);
    }
    return leads;
  }, [leads, currentRole]);

  const addLead = useCallback(
    async (input: NewLeadInput) => {
      const created = await insertLead(input);
      setLeads((prev) => [created, ...prev]);
      await addSystemNotification(
        'New Lead Registered',
        `${input.firstName} ${input.lastName} added via manual entry with a score of ${input.score}.`,
        'info',
      );
      showToast('Lead added successfully!');
    },
    [addSystemNotification, showToast],
  );

  const updateLead = useCallback(
    async (id: string, updates: LeadUpdateInput) => {
      const current = leads.find((l) => l.id === id);
      if (!current) return;
      const updated = await updateLeadRecord(id, updates, current);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast('Lead Profile Updated');
    },
    [leads, showToast],
  );

  const deleteLead = useCallback(
    async (id: string) => {
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;
      await deleteLeadRecord(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showToast(`Deleted lead ${lead.firstName} ${lead.lastName}`);
    },
    [leads, showToast],
  );

  return (
    <LeadsContext.Provider value={{ leads, scopedLeads, loading, addLead, updateLead, deleteLead }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within a LeadsProvider');
  return ctx;
}

import { createContext, useContext, useState, type ReactNode } from 'react';

interface OverlaysContextValue {
  leadDrawerLeadId: string | null;
  openLeadDrawer: (id: string) => void;
  closeLeadDrawer: () => void;

  isNewLeadModalOpen: boolean;
  openNewLeadModal: () => void;
  closeNewLeadModal: () => void;

  isNewCampaignModalOpen: boolean;
  openNewCampaignModal: () => void;
  closeNewCampaignModal: () => void;
}

const OverlaysContext = createContext<OverlaysContextValue | undefined>(undefined);

// Centralizes the app's global overlays (lead drawer + the two "create"
// modals) in one place. These need to be triggerable from multiple,
// otherwise-unrelated components (the topbar search dropdown, the
// dashboard's recent-leads table, the Leads directory table, etc.) and
// rendered exactly once at the layout root — matching how the original
// app.js kept one #leadDrawer / #leadModal element in the DOM regardless
// of which view was active.
export function OverlaysProvider({ children }: { children: ReactNode }) {
  const [leadDrawerLeadId, setLeadDrawerLeadId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setNewCampaignModalOpen] = useState(false);

  return (
    <OverlaysContext.Provider
      value={{
        leadDrawerLeadId,
        openLeadDrawer: setLeadDrawerLeadId,
        closeLeadDrawer: () => setLeadDrawerLeadId(null),
        isNewLeadModalOpen,
        openNewLeadModal: () => setNewLeadModalOpen(true),
        closeNewLeadModal: () => setNewLeadModalOpen(false),
        isNewCampaignModalOpen,
        openNewCampaignModal: () => setNewCampaignModalOpen(true),
        closeNewCampaignModal: () => setNewCampaignModalOpen(false),
      }}
    >
      {children}
    </OverlaysContext.Provider>
  );
}

export function useOverlays() {
  const ctx = useContext(OverlaysContext);
  if (!ctx) throw new Error('useOverlays must be used within an OverlaysProvider');
  return ctx;
}

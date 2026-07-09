import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Campaign, NewCampaignInput } from '@/types/campaign';
import { fetchCampaigns, insertCampaign, deleteCampaignRecord } from '@/lib/repositories/campaignsRepository';
import { useNotifications } from './NotificationsContext';
import { useToast } from './ToastContext';

interface CampaignsContextValue {
  campaigns: Campaign[];
  loading: boolean;
  addCampaign: (input: NewCampaignInput) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextValue | undefined>(undefined);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { addSystemNotification } = useNotifications();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCampaigns()
      .then(setCampaigns)
      .finally(() => setLoading(false));
  }, []);

  const addCampaign = useCallback(
    async (input: NewCampaignInput) => {
      const created = await insertCampaign(input);
      setCampaigns((prev) => [created, ...prev]);
      await addSystemNotification(
        'New Campaign Created',
        `"${input.name}" is now tracking lead acquisition.`,
        'info',
      );
      showToast('Campaign created.');
    },
    [addSystemNotification, showToast],
  );

  const deleteCampaign = useCallback(
    async (id: string) => {
      await deleteCampaignRecord(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      showToast('Campaign deleted.');
    },
    [showToast],
  );

  return (
    <CampaignsContext.Provider value={{ campaigns, loading, addCampaign, deleteCampaign }}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns must be used within a CampaignsProvider');
  return ctx;
}

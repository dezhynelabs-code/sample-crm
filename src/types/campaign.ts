export type CampaignStatus = 'active' | 'ended';

export interface Campaign {
  id: string;
  name: string;
  subtitle: string;
  status: CampaignStatus;
  spend: number;
  leadsGen: number;
}

export type NewCampaignInput = Omit<Campaign, 'id'>;

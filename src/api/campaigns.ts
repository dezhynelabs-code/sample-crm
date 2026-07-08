import { supabase } from '../lib/supabase';
import type { Campaign } from '../types';

export const getCampaigns = async (): Promise<Campaign[]> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Campaign[];
};

export const createCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign> => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaignData])
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Campaign;
};

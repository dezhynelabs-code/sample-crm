import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { seedDefaultCampaigns } from '@/lib/mockData';
import type { Campaign, NewCampaignInput } from '@/types/campaign';

const STORAGE_KEY = 'pipeline_campaigns';

function readLocal(): Campaign[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const seeded = seedDefaultCampaigns();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeLocal(campaigns: Campaign[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('campaigns').select('*');
    if (error) throw error;
    return data as Campaign[];
  }
  return readLocal();
}

export async function insertCampaign(input: NewCampaignInput): Promise<Campaign> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('campaigns').insert(input).select().single();
    if (error) throw error;
    return data as Campaign;
  }
  const newCampaign: Campaign = { id: 'camp_' + Math.floor(Math.random() * 10000000), ...input };
  const all = readLocal();
  writeLocal([newCampaign, ...all]);
  return newCampaign;
}

export async function deleteCampaignRecord(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const all = readLocal();
  writeLocal(all.filter((c) => c.id !== id));
}

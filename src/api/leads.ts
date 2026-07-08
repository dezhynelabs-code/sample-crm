import { supabase } from '../lib/supabase';
import type { Lead, LeadHistory } from '../types';

export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      owner:profiles(*),
      history:lead_history(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Sort history newest first
  const leads = data as unknown as Lead[];
  return leads.map(lead => ({
    ...lead,
    history: lead.history?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }));
};

export const createLead = async (leadData: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select()
    .single();

  if (error) throw error;
  
  // Insert initial history
  await supabase.from('lead_history').insert([{
    lead_id: data.id,
    type: 'CREATE',
    label: `Lead generated manually by user`
  }]);

  return data as unknown as Lead;
};

export const updateLead = async (id: string, updates: Partial<Lead>, historyLabel?: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (historyLabel) {
    await supabase.from('lead_history').insert([{
      lead_id: id,
      type: 'UPDATE',
      label: historyLabel
    }]);
  }

  return data as unknown as Lead;
};

export const deleteLead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

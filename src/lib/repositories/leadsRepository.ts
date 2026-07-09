import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { generateMockLeads } from '@/lib/mockData';
import type { Lead, NewLeadInput, LeadUpdateInput, LeadHistoryEntry } from '@/types/lead';

const STORAGE_KEY = 'pipeline_leads';

/**
 * Repository layer for Lead persistence.
 *
 * Every function here has exactly one implementation swap point: whether
 * `supabase` is configured. Contexts/components never touch localStorage
 * or the Supabase client directly — they only ever call these functions.
 * That means wiring the real `leads` table + RLS policies in the next
 * phase is a change confined entirely to this one file.
 */

function readLocal(): Lead[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const generated = generateMockLeads();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
  return generated;
}

function writeLocal(leads: Lead[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export async function fetchLeads(): Promise<Lead[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
  }
  return readLocal();
}

export async function insertLead(input: NewLeadInput): Promise<Lead> {
  const historyEntry: LeadHistoryEntry = {
    type: 'CREATE',
    label: 'Lead generated manually by ' + input.owner || 'Admin',
    time: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...input, history: [historyEntry] })
      .select()
      .single();
    if (error) throw error;
    return data as Lead;
  }

  const newLead: Lead = {
    id: 'lead_' + Math.floor(Math.random() * 10000000),
    ...input,
    notes: '',
    createdAt: new Date().toISOString(),
    history: [historyEntry],
  };
  const all = readLocal();
  writeLocal([newLead, ...all]);
  return newLead;
}

export async function updateLeadRecord(
  id: string,
  updates: LeadUpdateInput,
  current: Lead,
): Promise<Lead> {
  let historyLabel = '';
  if (updates.status && updates.status !== current.status) {
    historyLabel = `Status updated from ${current.status} to ${updates.status}`;
  }
  if (updates.owner !== undefined && updates.owner !== current.owner) {
    const prevOwner = current.owner || 'Unassigned';
    const newOwner = updates.owner || 'Unassigned';
    historyLabel = `Reassigned from ${prevOwner} to ${newOwner}`;
  }
  if (!historyLabel && updates.notes !== undefined && updates.notes !== current.notes && updates.notes) {
    historyLabel = 'Internal note updated';
  }

  const history = [
    ...current.history,
    ...(historyLabel
      ? [{ type: 'UPDATE' as const, label: historyLabel, time: new Date().toISOString() }]
      : []),
  ];

  const updated: Lead = { ...current, ...updates, history };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, history })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Lead;
  }

  const all = readLocal();
  const next = all.map((l) => (l.id === id ? updated : l));
  writeLocal(next);
  return updated;
}

export async function deleteLeadRecord(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const all = readLocal();
  writeLocal(all.filter((l) => l.id !== id));
}

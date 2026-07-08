import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export const getProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateProfileRole = async ({ id, role }: { id: string, role: string }): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id);

  if (error) throw error;
};

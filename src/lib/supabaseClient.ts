import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether the app should read/write against Supabase or fall back to the
 * local mock data layer (localStorage-backed, matching the original
 * vanilla-JS dashboard's behavior).
 *
 * This is intentionally a hard switch rather than a silent fallback-on-
 * error: during this phase of the migration, the Supabase schema/RLS
 * policies haven't been created yet (that's the next phase), so the app
 * defaults to mock data until real credentials + schema exist.
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  import.meta.env.VITE_USE_MOCK_DATA !== 'true';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

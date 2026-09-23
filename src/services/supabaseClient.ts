import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read public client configuration from environment (VITE_ prefixed only)
// Notice: Never include or expose SUPABASE_SERVICE_ROLE_KEY here in client code!
const env = (import.meta as any).env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || '') as string;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '') as string;

export const isLiveSupabaseConnected: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isLiveSupabaseConnected
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

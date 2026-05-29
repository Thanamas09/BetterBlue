import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Lazy singleton — avoids throwing at module load during static builds
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env variables are missing. Please configure .env.local');
    // Return a dummy client that won't crash at module load
    _supabase = createClient('https://placeholder.supabase.co', 'placeholder');
    return _supabase;
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Proxy so all existing code keeps working as `supabase.from(...)` etc.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

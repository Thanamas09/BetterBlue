import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Lazy singleton — avoids throwing at module load during static builds
let _supabase: SupabaseClient<Database, 'public'> | null = null;

function getSupabaseClient(): SupabaseClient<Database, 'public'> {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env variables are missing. Please configure .env.local');
    // Return a dummy client that won't crash at module load
    _supabase = createClient<Database, 'public'>('https://placeholder.supabase.co', 'placeholder');
    return _supabase;
  }
  _supabase = createClient<Database, 'public'>(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

const supabase = getSupabaseClient();
export { supabase };

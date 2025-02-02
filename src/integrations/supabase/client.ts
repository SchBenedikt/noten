import { createClient } from '@supabase/supabase-js';

const supabaseUrl = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('No Supabase URL found. Please configure it in the settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
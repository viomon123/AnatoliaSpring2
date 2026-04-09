import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initializeDatabase() {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) console.error('Supabase connection error:', error);
    return !error;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export async function insertVote(ranks) {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  }
  const { error } = await supabase
    .from('votes')
    .insert({ ranks, user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null });
  if (error) throw error;
}

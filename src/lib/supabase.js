import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export async function insertVote({ ranks, prefersDark, previewModes }) {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  }
  const payload = {
    ranks,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  };
  if (typeof prefersDark === 'boolean') payload.prefers_dark = prefersDark;
  if (previewModes && typeof previewModes === 'object' && Object.keys(previewModes).length > 0) {
    payload.preview_modes = previewModes;
  }
  const { error } = await supabase.from('votes').insert(payload);
  if (error) throw error;
}

export async function fetchVotes() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase
    .from('votes')
    .select('id, created_at, ranks, prefers_dark, preview_modes, user_agent')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

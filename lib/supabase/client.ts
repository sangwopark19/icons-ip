import { createBrowserClient } from '@supabase/ssr';
import { requireSupabaseConfig } from './config';

/** Supabase client for Client Components. */
export function createClient() {
  const { url, key } = requireSupabaseConfig();
  return createBrowserClient(url, key);
}

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Use createBrowserClient from @supabase/ssr to properly handle cookies
  // This ensures cookies are set and read correctly for SSR
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

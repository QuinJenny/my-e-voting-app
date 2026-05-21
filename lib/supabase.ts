import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

type BrowserClient = ReturnType<typeof createBrowserClient>;

declare global {
  // eslint-disable-next-line no-var
  var __voteSecureSupabaseClient: BrowserClient | undefined;
}

// Client Component Client (singleton in browser to avoid multiple GoTrueClient instances)
export const createClientComponentClient = () => {
  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  if (!globalThis.__voteSecureSupabaseClient) {
    globalThis.__voteSecureSupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return globalThis.__voteSecureSupabaseClient;
};

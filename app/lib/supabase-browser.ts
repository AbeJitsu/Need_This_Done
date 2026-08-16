import { createBrowserClient } from '@supabase/ssr';

// This module is the only Supabase client shared with browser components.
// Keep server-admin initialization in `supabase.ts`, which is server-only.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildTime && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Did you copy .env.example to .env.local and fill in your credentials?'
  );
}

export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

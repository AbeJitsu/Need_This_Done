// ============================================================================
// Safe Supabase Client Initialization - Error Handling Wrapper
// ============================================================================
// What: Wraps Supabase client creation with error handling
// Why: Prevents silent failures when environment variables are missing
// How: Validates environment variables before creating client, provides clear errors

import { NextResponse } from 'next/server';
import { serverError } from './api-errors';

/**
 * Configuration validation result
 */
interface ConfigError {
  isValid: false;
  error: NextResponse;
  missingVars: string[];
}

interface ConfigOk {
  isValid: true;
  url: string;
  key: string;
}

type ConfigResult = ConfigError | ConfigOk;

/**
 * Validate Supabase environment variables
 * Returns either valid config or a ready-to-send error response
 *
 * @returns Configuration result with either valid URL/key or error response
 *
 * @example
 * const config = validateSupabaseConfig();
 * if (!config.isValid) return config.error;
 *
 * const supabase = createClient(config.url, config.key);
 */
export function validateSupabaseConfig(): ConfigResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missingVars: string[] = [];

  if (!url) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!key) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    console.error('[Supabase] Missing required environment variables:', missingVars);

    return {
      isValid: false,
      missingVars,
      error: serverError(
        'Database service is not configured. Please contact support.'
      ),
    };
  }

  return {
    isValid: true,
    url: url!,
    key: key!,
  };
}

/**
 * Validate service role key (for admin operations)
 * Returns either valid config or a ready-to-send error response
 *
 * @returns Configuration result
 *
 * @example
 * const config = validateSupabaseAdminConfig();
 * if (!config.isValid) return config.error;
 *
 * const supabaseAdmin = createClient(config.url, config.key);
 */
export function validateSupabaseAdminConfig(): ConfigResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missingVars: string[] = [];

  if (!url) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!key) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missingVars.length > 0) {
    console.error('[Supabase] Missing required admin environment variables:', missingVars);

    return {
      isValid: false,
      missingVars,
      error: serverError(
        'Database service is not configured. Please contact support.'
      ),
    };
  }

  return {
    isValid: true,
    url: url!,
    key: key!,
  };
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Safe client creation in API route
// ──────────────────────────────────────────────
// import { validateSupabaseConfig } from '@/lib/supabase-client-safe';
// import { createClient } from '@supabase/supabase-js';
//
// export async function GET(request: NextRequest) {
//   const config = validateSupabaseConfig();
//   if (!config.isValid) return config.error;
//
//   const supabase = createClient(config.url, config.key);
//   // ... use client safely
// }
//
// Example 2: Safe admin client creation
// ──────────────────────────────────────
// import { validateSupabaseAdminConfig } from '@/lib/supabase-client-safe';
// import { createClient } from '@supabase/supabase-js';
//
// export async function POST(request: NextRequest) {
//   const config = validateSupabaseAdminConfig();
//   if (!config.isValid) return config.error;
//
//   const supabaseAdmin = createClient(config.url, config.key, {
//     auth: { persistSession: false }
//   });
//   // ... use admin client safely
// }
//
// Example 3: Custom error handling per route
// ───────────────────────────────────────────
// const config = validateSupabaseConfig();
// if (!config.isValid) {
//   // Provide route-specific error message
//   return NextResponse.json(
//     { error: 'Chat service is temporarily unavailable' },
//     { status: 503 }
//   );
// }

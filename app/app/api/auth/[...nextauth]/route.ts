// ============================================================================
// NextAuth.js API Route Handler
// ============================================================================
// What: Handles all authentication routes (/api/auth/*)
// Why: Direct Google OAuth shows needthisdone.com instead of Supabase URL
// How: Uses NextAuth.js with Google provider, syncs users to Supabase Auth

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ============================================================================
// Route Handler
// ============================================================================

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

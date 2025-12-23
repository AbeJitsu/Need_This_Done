// ============================================================================
// NextAuth Configuration
// ============================================================================
// What: Centralized NextAuth options for Google OAuth and credentials auth
// Why: Direct Google OAuth shows needthisdone.com instead of Supabase URL
// How: Uses NextAuth.js with Google provider, syncs users to Supabase Auth

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Supabase Admin Client (for user sync)
// ============================================================================
// Only created if SUPABASE_SERVICE_ROLE_KEY is set. Google OAuth user sync
// will be skipped if this client isn't available (users can still sign in,
// they just won't be auto-synced to Supabase Auth).

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAdmin = supabaseServiceRoleKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

if (!supabaseAdmin && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[auth-options] SUPABASE_SERVICE_ROLE_KEY not set. Google OAuth user sync disabled.'
  );
}

// ============================================================================
// NextAuth Configuration
// ============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    // ========================================================================
    // Google OAuth Provider
    // ========================================================================
    // Users see needthisdone.com during sign-in, not a third-party URL
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ========================================================================
    // Credentials Provider (Email/Password)
    // ========================================================================
    // For users who prefer traditional email/password login
    // Still uses Supabase Auth under the hood for password verification
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use Supabase to verify credentials
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
              image: data.user.user_metadata?.avatar_url,
            };
          }

          return null;
        } catch (error) {
          console.error('Credentials auth error:', error);
          return null;
        }
      },
    }),
  ],

  // ==========================================================================
  // Session Configuration
  // ==========================================================================
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ==========================================================================
  // Callbacks - Sync Users to Supabase Auth
  // ==========================================================================
  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user, account }) {
      // On initial sign-in, add user info to token
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
        token.provider = account?.provider;
        // Include admin status (set during signIn callback)
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },

    // Called when session is checked
    async session({ session, token }) {
      if (session.user) {
        // Use supabaseUserId if available (set during signIn callback)
        session.user.id = (token.supabaseUserId as string) || (token.id as string) || '';
        session.user.email = (token.email as string) || '';
        session.user.name = (token.name as string) || null;
        session.user.image = (token.picture as string) || null;
        // Include admin status for client-side checks
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean ?? false;
      }
      return session;
    },

    // Called on sign-in - sync Google users to Supabase Auth
    async signIn({ user, account }) {
      // Only sync OAuth users (credentials already exist in Supabase)
      if (account?.provider === 'google' && user.email) {
        // Skip sync if admin client not configured
        if (!supabaseAdmin) {
          console.warn('[signIn] Skipping Supabase sync - admin client not configured');
          return true;
        }

        try {
          // Check if user exists in Supabase Auth
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email === user.email);

          if (!existingUser) {
            // Create user in Supabase Auth (so RLS and foreign keys work)
            const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                name: user.name,
                avatar_url: user.image,
                provider: 'google',
              },
            });

            if (error) {
              console.error('Failed to create Supabase user:', error);
            } else {
              // Store Supabase user ID for session
              user.id = newUser.user.id;
            }
          } else {
            // Use existing Supabase user ID and admin status
            user.id = existingUser.id;
            (user as { isAdmin?: boolean }).isAdmin = existingUser.user_metadata?.is_admin === true;
          }
        } catch (error) {
          // Log but don't block sign-in if Supabase sync fails
          console.error('Failed to sync user to Supabase Auth:', error);
        }
      }

      return true; // Allow sign-in to proceed
    },
  },

  // ==========================================================================
  // Pages - Custom UI
  // ==========================================================================
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // ==========================================================================
  // Debug mode (only in development)
  // ==========================================================================
  debug: process.env.NODE_ENV === 'development',
};

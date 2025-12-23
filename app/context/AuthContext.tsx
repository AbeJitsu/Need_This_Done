'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { onAuthStateChange } from '@/lib/auth';

// ============================================================================
// Auth Context - Share User Session Across the App
// ============================================================================
// This context makes the current user's information available to any component.
// Components can check if a user is logged in, get their email/ID, etc.
// without having to pass props all the way down the component tree.
//
// HYBRID AUTH: Supports both NextAuth (Google OAuth) and Supabase (email/password)

interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  user_metadata?: {
    name?: string;
    is_admin?: boolean;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'user' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Auth Provider Component
// ============================================================================
// Wrap your app with this provider to enable auth context everywhere.
// Typically placed in the root layout or a top-level component.
//
// Checks both NextAuth session (for Google OAuth) and Supabase auth
// (for email/password users). NextAuth takes precedence if both exist.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // NextAuth session
  const { data: session, status: sessionStatus } = useSession();

  // Supabase auth state (for email/password fallback)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(true);

  useEffect(() => {
    // ====================================================================
    // Listen for Supabase Auth State Changes
    // ====================================================================
    // For users who signed in with email/password through Supabase

    const unsubscribe = onAuthStateChange((authUser) => {
      if (authUser) {
        setSupabaseUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name,
          user_metadata: authUser.user_metadata,
        });
      } else {
        setSupabaseUser(null);
      }
      setSupabaseLoading(false);
    });

    // ====================================================================
    // Cleanup
    // ====================================================================
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // ============================================================================
  // Merge Auth Sources - NextAuth takes precedence
  // ============================================================================

  const isLoading = sessionStatus === 'loading' || supabaseLoading;

  // Determine the active user - NextAuth session takes precedence
  const sessionUser = session?.user as { id?: string; email?: string | null; name?: string | null; image?: string | null; isAdmin?: boolean } | undefined;
  const user: User | null = sessionUser
    ? {
        id: sessionUser.id || sessionUser.email || '',
        email: sessionUser.email || undefined,
        name: sessionUser.name || undefined,
        image: sessionUser.image || undefined,
        user_metadata: {
          name: sessionUser.name || undefined,
          avatar_url: sessionUser.image || undefined,
          is_admin: sessionUser.isAdmin ?? false,
        },
      }
    : supabaseUser;

  // ============================================================================
  // Derive Admin Status and Role from User Metadata
  // ============================================================================

  const isAdmin = user?.user_metadata?.is_admin === true;
  const userRole: 'admin' | 'user' | null = user
    ? isAdmin
      ? 'admin'
      : 'user'
    : null;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// useAuth Hook - Use This in Your Components
// ============================================================================
// Instead of importing AuthContext directly, use this hook.
// It makes the code cleaner and easier to read.
//
// Example usage:
// const { user, isAuthenticated, isLoading } = useAuth();
// if (isAuthenticated) {
//   return <div>Welcome, {user?.email}</div>;
// }

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

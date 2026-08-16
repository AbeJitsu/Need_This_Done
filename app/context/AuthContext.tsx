'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase-browser';
import { onAuthStateChange } from '@/lib/auth';

// ============================================================================
// Auth Context - Share the canonical Supabase Auth session across the app
// ============================================================================

interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  user_metadata?: {
    name?: string;
    [key: string]: unknown;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [databaseAdmin, setDatabaseAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const bridgeAttemptedFor = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser ? {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name,
        image: authUser.user_metadata?.avatar_url,
        user_metadata: authUser.user_metadata,
      } : null);
      setSupabaseLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const email = nextAuthSession?.user?.email;
    if (nextAuthStatus !== 'authenticated' || !email || user || supabaseLoading) return;
    if (bridgeAttemptedFor.current === email) return;

    bridgeAttemptedFor.current = email;
    let cancelled = false;
    setBridgeLoading(true);

    fetch('/api/auth/supabase-bridge', { method: 'POST', cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body.session) throw new Error(body.error || 'Google session bridge failed');
        const { error } = await supabase.auth.setSession(body.session);
        if (error) throw error;
      })
      .catch((error) => {
        console.error('[AuthProvider] Google session bridge failed:', error);
      })
      .finally(() => {
        if (!cancelled) setBridgeLoading(false);
      });

    return () => { cancelled = true; };
  }, [nextAuthSession?.user?.email, nextAuthStatus, supabaseLoading, user]);

  useEffect(() => {
    if (!user) {
      setDatabaseAdmin(false);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;
    setRoleLoading(true);
    fetch('/api/auth/operator-role', { cache: 'no-store' })
      .then(async (response) => response.ok && (await response.json()).isAdmin === true)
      .then((isAdmin) => {
        if (!cancelled) setDatabaseAdmin(isAdmin);
      })
      .catch(() => {
        if (!cancelled) setDatabaseAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setRoleLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  const nextAuthEmail = nextAuthSession?.user?.email || null;
  const bridgeHasNotStarted = nextAuthStatus === 'authenticated'
    && !user
    && bridgeAttemptedFor.current !== nextAuthEmail;
  const isLoading = supabaseLoading
    || roleLoading
    || bridgeLoading
    || bridgeHasNotStarted
    || nextAuthStatus === 'loading';
  const isAdmin = databaseAdmin;
  const userRole: 'admin' | 'user' | null = user
    ? isAdmin ? 'admin' : 'user'
    : null;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin,
      userRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

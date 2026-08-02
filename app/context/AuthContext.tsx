'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [databaseAdmin, setDatabaseAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

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

  const isLoading = supabaseLoading || roleLoading;
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

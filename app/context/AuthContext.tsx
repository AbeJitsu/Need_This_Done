'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '@/lib/auth';

// ============================================================================
// Auth Context - Share User Session Across the App
// ============================================================================
// This context makes the current user's information available to any component.
// Components can check if a user is logged in, get their email/ID, etc.
// without having to pass props all the way down the component tree.

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Auth Provider Component
// ============================================================================
// Wrap your app with this provider to enable auth context everywhere.
// Typically placed in the root layout or a top-level component.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ====================================================================
    // Listen for Auth State Changes
    // ====================================================================
    // When the user logs in or out, update the context.
    // This keeps the UI in sync with the actual auth state.

    const unsubscribe = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          user_metadata: authUser.user_metadata,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // ====================================================================
    // Cleanup
    // ====================================================================
    // When the component unmounts, stop listening for changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
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

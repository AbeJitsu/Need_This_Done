'use client';

// ============================================================================
// NextAuth Session Provider Wrapper
// ============================================================================
// What: Wraps the app with NextAuth's SessionProvider
// Why: Required for useSession hook to work in client components
// How: Re-exports SessionProvider as a client component

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface Props {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

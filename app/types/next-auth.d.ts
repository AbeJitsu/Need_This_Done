// ============================================================================
// NextAuth Type Extensions
// ============================================================================
// Extends NextAuth's default types to include custom properties
// that we add in our callbacks (like user id from Supabase)

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    isAdmin?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    provider?: string;
    supabaseUserId?: string;
    isAdmin?: boolean;
  }
}

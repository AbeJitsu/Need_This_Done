import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * NextAuth keeps the existing branded Google redirect. It is not accepted as
 * application authorization by itself. After the callback, the Google ID
 * token must be verified by Supabase Auth and exchanged for a Supabase session.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== 'google') return false;
      return Boolean(account.id_token && user.email);
    },
    async jwt({ token, account }) {
      if (account?.provider === 'google') {
        token.provider = 'google';
        token.googleIdToken = account.id_token;
        token.googleIdTokenExpiresAt = account.expires_at;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NEXTAUTH_DEBUG === 'true' && process.env.NODE_ENV !== 'production',
};

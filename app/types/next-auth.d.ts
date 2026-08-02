import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: 'google';
    googleIdToken?: string;
    googleIdTokenExpiresAt?: number;
  }
}

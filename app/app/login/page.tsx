// ============================================================================
// Login Page - Server Component Wrapper
// ============================================================================
// This is a Server Component that marks the route as dynamic and imports
// the client-side login form. This pattern allows force-dynamic to work
// correctly while still using client-side features like useContext.

import LoginClient from './LoginClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private Team Sign-In | NeedThisDone',
  description: 'Authorized NeedThisDone team access only.',
  robots: { index: false, follow: false },
};

// Force dynamic rendering - prevents static prerendering
// This must be in a Server Component (no 'use client') to work
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <LoginClient googleEnabled={googleEnabled} />;
}

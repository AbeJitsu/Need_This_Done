// ============================================================================
// Login Page - Server Component Wrapper
// ============================================================================
// This is a Server Component that marks the route as dynamic and imports
// the client-side login form. This pattern allows force-dynamic to work
// correctly while still using client-side features like useContext.

import LoginClient from './LoginClient';

// Force dynamic rendering - prevents static prerendering
// This must be in a Server Component (no 'use client') to work
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginClient />;
}

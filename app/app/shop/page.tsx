import { redirect } from 'next/navigation';

// ============================================================================
// Shop Page - Redirects to /pricing
// ============================================================================
// The /shop page has been consolidated into /pricing.
// This redirect ensures old links and bookmarks still work.

export default function ShopPage() {
  redirect('/pricing');
}

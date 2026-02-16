import { redirect } from 'next/navigation';

// ============================================================================
// Shop Page — Redirects to /pricing
// ============================================================================
// The pricing page now serves as both the catalog and the storefront.
// Product detail pages at /shop/{handle} still work — only the listing redirects.

export default function ShopPage() {
  redirect('/pricing');
}

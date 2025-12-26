import { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ShopClient from '@/components/shop/ShopClient';
import { medusaClient, type Product } from '@/lib/medusa-client';

// ============================================================================
// Shop Page - Product Catalog
// ============================================================================
// What: Displays all available products/services for purchase
// Why: Enables customers to browse and add items to cart
// How: Server Component fetches products directly from Medusa, Client Component handles cart

// Force dynamic rendering - products come from Medusa API
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quick Consultations - NeedThisDone',
  description: 'Book a call for expert guidance, ask questions, or figure out what you actually need, before committing to anything.',
};

// ============================================================================
// Data Fetching - Directly from Medusa (bypasses SSL issues in dev)
// ============================================================================

async function getProducts(): Promise<Product[]> {
  // Retry logic with exponential backoff for startup timing issues
  // Handles both:
  // 1. Network errors (Medusa not ready yet)
  // 2. Empty results (Medusa running but not seeded yet)
  //
  // Pure exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 512s
  // Total wait time: ~17 minutes max (if Medusa takes that long, bigger issues exist)
  const maxRetries = 10;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const products = await medusaClient.products.list();

      // If we got products, return them sorted by price
      if (products.length > 0) {
        return products.sort((a, b) => {
          const priceA = a.variants?.[0]?.prices?.[0]?.amount ?? 0;
          const priceB = b.variants?.[0]?.prices?.[0]?.amount ?? 0;
          return priceA - priceB;
        });
      }

      // Empty products - Medusa running but not seeded yet, retry
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt) {
        console.warn('[Shop] No products found after all retries (database may not be seeded)');
        return [];
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      // Network error - Medusa not ready yet, retry
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        console.error('[Shop] Failed to fetch products after all retries:', error);
        return [];
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return [];
}

// ============================================================================
// Page Component - Server Component
// ============================================================================

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="Quick Consultations"
        description="Not ready for a full project? Book a call first. Get expert guidance, ask questions, or figure out what you actually need, before committing to anything."
      />

      {/* Client-side interactivity (cart, add buttons) */}
      <ShopClient products={products} />
    </div>
  );
}

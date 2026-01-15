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
  // Fast-fail retry logic - don't block page render waiting for Medusa
  // If Medusa is down, show empty products quickly and let user see the page
  //
  // 3 retries with 1s base delay = ~7 seconds max wait time
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await medusaClient.products.list();
      // Handle both array and paginated response
      const products: Product[] = Array.isArray(result) ? result : result.products;

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

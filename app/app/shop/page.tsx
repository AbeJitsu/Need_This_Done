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
  description: 'Book a call for expert guidance, ask questions, or figure out what you actually need—before committing to anything.',
};

// ============================================================================
// Data Fetching - Directly from Medusa (bypasses SSL issues in dev)
// ============================================================================

async function getProducts(): Promise<Product[]> {
  try {
    const products = await medusaClient.products.list();

    // Sort by price ascending: green ($20) → blue ($35) → purple ($50)
    return products.sort((a, b) => {
      const priceA = a.variants?.[0]?.prices?.[0]?.amount ?? 0;
      const priceB = b.variants?.[0]?.prices?.[0]?.amount ?? 0;
      return priceA - priceB;
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
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
        description="Not ready for a full project? Book a call first. Get expert guidance, ask questions, or figure out what you actually need—before committing to anything."
      />

      {/* Client-side interactivity (cart, add buttons) */}
      <ShopClient products={products} />
    </div>
  );
}

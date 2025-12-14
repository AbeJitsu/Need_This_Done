import { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ShopClient from '@/components/shop/ShopClient';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Shop Page - Product Catalog
// ============================================================================
// What: Displays all available products/services for purchase
// Why: Enables customers to browse and add items to cart
// How: Server Component fetches products instantly, Client Component handles cart

// Force dynamic rendering - products come from Medusa API
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quick Consultations - NeedThisDone',
  description: 'Book a call for expert guidance, ask questions, or figure out what you actually need—before committing to anything.',
};

// ============================================================================
// Data Fetching - Runs on Server
// ============================================================================

async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/shop/products`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error('Failed to fetch products:', response.status);
      return [];
    }

    const data = await response.json();
    return data.products || [];
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

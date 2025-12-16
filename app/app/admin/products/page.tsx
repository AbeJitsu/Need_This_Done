import { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import AdminProductsClient from '@/components/admin/AdminProductsClient';
import { medusaClient } from '@/lib/medusa-client';

// ============================================================================
// Admin Products Page
// ============================================================================
// What: Admin interface for managing product images
// Why: Allows updating product images without accessing Medusa admin at :9000
// How: Server Component fetches products, Client Component handles uploads

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manage Products - Admin',
  description: 'Update product images and details',
};

// ============================================================================
// Data Fetching
// ============================================================================

async function getProducts() {
  try {
    const products = await medusaClient.products.list();
    return products.sort((a, b) => {
      const priceA = a.variants?.[0]?.prices?.[0]?.amount ?? 0;
      const priceB = b.variants?.[0]?.prices?.[0]?.amount ?? 0;
      return priceA - priceB;
    });
  } catch (error) {
    console.error('[Admin Products] Failed to fetch products:', error);
    return [];
  }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <PageHeader
        title="Manage Products"
        description="Update product images by uploading new files or providing URLs from Supabase Storage."
      />

      <AdminProductsClient products={products} />
    </div>
  );
}

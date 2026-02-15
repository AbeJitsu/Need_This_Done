import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from '@/components/shop/ProductDetailClient';
import { medusaClient, type Product } from '@/lib/medusa-client';

// ============================================================================
// Product Detail Page - /shop/[productId]
// ============================================================================
// What: Shows full product details with add to cart functionality
// Why: Lets customers review before adding to cart
// How: Server Component fetches product directly from Medusa, Client Component handles interactivity

// Force dynamic rendering - products come from Medusa API
export const dynamic = 'force-dynamic';

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}): Promise<Metadata> {
  const product = await getProduct(params.productId);

  if (!product) {
    return {
      title: 'Product Not Found - NeedThisDone',
    };
  }

  return {
    title: `${product.title} - NeedThisDone`,
    description: product.description || `Book a ${product.title} consultation`,
    alternates: { canonical: `/shop/${params.productId}` },
    openGraph: {
      title: `${product.title} - NeedThisDone`,
      description: product.description || `Book a ${product.title} consultation`,
      type: 'website',
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${product.title} - NeedThisDone`,
      description: product.description || `Book a ${product.title} consultation`,
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

// ============================================================================
// Data Fetching - Directly from Medusa (bypasses SSL issues in dev)
// ============================================================================

async function getProduct(productId: string): Promise<Product | null> {
  try {
    // Detect if this is a product ID (starts with "prod_") or a handle
    const isProductId = productId.startsWith('prod_');

    if (isProductId) {
      return await medusaClient.products.get(productId);
    } else {
      // Lookup by handle
      return await medusaClient.products.getByHandle(productId);
    }
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// ============================================================================
// Page Component - Server Component
// ============================================================================

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

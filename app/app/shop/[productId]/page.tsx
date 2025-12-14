import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from '@/components/shop/ProductDetailClient';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Product Detail Page - /shop/[productId]
// ============================================================================
// What: Shows full product details with add to cart functionality
// Why: Lets customers review before adding to cart
// How: Server Component fetches product instantly, Client Component handles interactivity

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
  };
}

// ============================================================================
// Data Fetching - Runs on Server
// ============================================================================

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/shop/products/${productId}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.product;
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

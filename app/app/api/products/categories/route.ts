export const dynamic = 'force-dynamic';

// ============================================================================
// Product Categories API
// ============================================================================
// What: Fetch all product categories for filtering and discovery
// Why: Enable category-based browsing for better product discovery
// How: Query Medusa product catalog and extract unique categories

import { NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';

interface CategoryOption {
  name: string;
  handle: string;
  productCount: number;
}

export async function GET() {
  try {
    // Fetch all products to extract categories
    let response;
    try {
      response = await medusaClient.products.list({ limit: 100, offset: 0 });
    } catch (error) {
      // During static generation or when Medusa is unavailable, return empty categories
      console.debug('Medusa API unavailable during static generation, returning empty categories');
      return NextResponse.json({
        categories: [],
        count: 0,
      });
    }

    // Handle both paginated and non-paginated responses
    const products = Array.isArray(response) ? response : (response?.products || []);

    if (!products || products.length === 0) {
      return NextResponse.json({
        categories: [],
        count: 0,
      });
    }

    // Extract unique categories from product metadata or collection
    const categoriesMap = new Map<string, { name: string; handle: string; count: number }>();

    products.forEach(product => {
      // Try to get category from metadata first
      const categoryName = product.metadata?.category || product.metadata?.product_type;

      if (categoryName) {
        const categoryHandle = String(categoryName).toLowerCase().replace(/\s+/g, '-');

        if (categoriesMap.has(categoryHandle)) {
          const existing = categoriesMap.get(categoryHandle)!;
          existing.count += 1;
        } else {
          categoriesMap.set(categoryHandle, {
            name: String(categoryName),
            handle: categoryHandle,
            count: 1,
          });
        }
      }
    });

    // Convert map to sorted array
    const categories: CategoryOption[] = Array.from(categoriesMap.values())
      .map(cat => ({
        name: cat.name,
        handle: cat.handle,
        productCount: cat.count,
      }))
      .sort((a, b) => b.productCount - a.productCount);

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    // Return empty categories instead of error during static generation
    return NextResponse.json({
      categories: [],
      count: 0,
    });
  }
}

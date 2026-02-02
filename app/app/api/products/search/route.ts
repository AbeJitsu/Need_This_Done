// ============================================================================
// Search Products API
// ============================================================================
// What: Filter and search products by title, description, price
// Why: Support product discovery on the listing page
// How: Query all products and filter by search term and price range

import { NextResponse, NextRequest } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : Infinity;
    const category = searchParams.get('category')?.toLowerCase() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch all products with pagination
    const response = await medusaClient.products.list({ limit: 100, offset });

    // Handle both paginated and non-paginated responses
    const products = Array.isArray(response) ? response : response.products;
    const totalCount = Array.isArray(response) ? products.length : response.count;

    // Filter products by search query, category, and price
    const filtered = products.filter(product => {
      // Text search in title and description
      const matchesQuery = !query ||
        product.title.toLowerCase().includes(query) ||
        (product.description?.toLowerCase().includes(query) ?? false);

      // Category filter - match against product metadata
      let matchesCategory = true;
      if (category) {
        const productCategory = (product.metadata?.category || product.metadata?.product_type || '')
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-');
        matchesCategory = productCategory === category;
      }

      // Get the product price (from first variant or metadata)
      const price = product.variants?.[0]?.calculated_price?.calculated_amount ??
                   product.prices?.[0]?.amount ??
                   0;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      return matchesQuery && matchesCategory && matchesPrice;
    });

    return NextResponse.json({
      products: filtered,
      count: filtered.length,
      total: totalCount,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}

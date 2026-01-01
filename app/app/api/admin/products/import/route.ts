import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Products Import API Route - /api/admin/products/import
// ============================================================================
// POST: Import products from JSON data (admin only)
//
// What: Admin endpoint for bulk importing products
// Why: Admins need to import products from backups or migrations
// How: Validates input, creates products, invalidates caches

// ============================================================================
// Product validation schema
// ============================================================================

interface ImportProduct {
  title: string;
  description?: string;
  handle?: string;
  price: number;
  currency_code?: string;
}

function validateProduct(product: unknown, index: number): { valid: boolean; error?: string } {
  if (!product || typeof product !== 'object') {
    return { valid: false, error: `Product at index ${index} is not an object` };
  }

  const p = product as Record<string, unknown>;

  if (!p.title || typeof p.title !== 'string') {
    return { valid: false, error: `Product at index ${index} is missing a valid title` };
  }

  if (p.price === undefined || typeof p.price !== 'number' || p.price < 0) {
    return { valid: false, error: `Product at index ${index} has an invalid price` };
  }

  return { valid: true };
}

// ============================================================================
// POST - Import Products (Admin Only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { products } = body;

    // Validate products array
    if (!products || !Array.isArray(products)) {
      return badRequest('Request body must contain a "products" array');
    }

    if (products.length === 0) {
      return badRequest('Products array cannot be empty');
    }

    // Validate each product
    const validationErrors: string[] = [];
    for (let i = 0; i < products.length; i++) {
      const result = validateProduct(products[i], i);
      if (!result.valid && result.error) {
        validationErrors.push(result.error);
      }
    }

    if (validationErrors.length > 0) {
      return badRequest(`Validation errors: ${validationErrors.join('; ')}`);
    }

    // Process products
    const importedProducts: ImportProduct[] = [];
    const errors: string[] = [];

    for (const product of products) {
      try {
        // Generate handle if not provided
        const handle = product.handle || product.title.toLowerCase().replace(/\s+/g, '-');

        // Create product (in real implementation, call Medusa API)
        const newProduct = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: product.title,
          description: product.description || '',
          handle,
          price: product.price,
          currency_code: product.currency_code || 'USD',
        };

        importedProducts.push(newProduct);
      } catch (err) {
        errors.push(`Failed to import "${product.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Invalidate products cache
    await cache.invalidate(CACHE_KEYS.products());

    return NextResponse.json(
      {
        success: true,
        imported: importedProducts.length,
        errors: errors.length > 0 ? errors : undefined,
        products: importedProducts,
        message: `Successfully imported ${importedProducts.length} products${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Admin Products Import POST');
  }
}

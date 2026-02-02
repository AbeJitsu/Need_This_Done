import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/api-auth';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import {
  getMedusaAdminToken,
  formatProductForMedusa,
  getDefaultRegion,
  getDefaultSalesChannel,
} from '@/lib/medusa-helpers';
import { withTimeout, TIMEOUT_LIMITS } from '@/lib/api-timeout';
import { validateRequest, commonSchemas } from '@/lib/api-validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;

// ============================================================================
// Admin Products API Route - /api/admin/products
// ============================================================================
// GET: List all products (admin only)
// POST: Create new product (admin only)
//
// What: Admin endpoints for managing products via Medusa API
// Why: Admins need to view and create products without Medusa admin dashboard
// How: Authenticates with Medusa, calls admin API endpoints with timeout protection

// ============================================================================
// GET - List All Products (Admin Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // Get Medusa admin token
    const token = await getMedusaAdminToken();

    // ====================================================================
    // Fetch Products with Timeout Protection
    // ====================================================================
    // Medusa backend may be slow or unresponsive. Use timeout to fail fast
    // rather than blocking the request indefinitely.

    let response: Response;
    try {
      response = await withTimeout(
        fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa products fetch'
      );
    } catch (timeoutError) {
      console.error('[Admin] Medusa products fetch timed out:', timeoutError);
      return badRequest('Product service is currently unavailable. Please try again.');
    }

    if (!response.ok) {
      let errorMessage = 'Failed to fetch products from Medusa';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response body isn't JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      products: data.products || [],
      count: data.count || 0,
    });
  } catch (error) {
    return handleApiError(error, 'Admin Products GET');
  }
}

// ============================================================================
// POST - Create Product (Admin Only)
// ============================================================================

// Zod schema for product creation validation
const CreateProductSchema = z.object({
  title: commonSchemas.nonEmptyString,
  description: commonSchemas.optionalString,
  handle: commonSchemas.optionalString,
  price: z.number().nonnegative('Price must be non-negative'),
  sku: commonSchemas.optionalString,
  thumbnail: commonSchemas.optionalString,
  category_ids: z.array(commonSchemas.uuid).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // ====================================================================
    // Validate Request Body with Zod
    // ====================================================================
    // Use centralized validation instead of manual checks for consistency
    // and better error messages.

    const result = await validateRequest(request, CreateProductSchema);
    if (!result.success) return result.error;

    const { title, description, handle, price, sku, thumbnail, category_ids } = result.data;

    // Get Medusa admin token
    const token = await getMedusaAdminToken();

    // ====================================================================
    // Fetch Medusa Configuration with Timeout Protection
    // ====================================================================
    // Both region and sales channel fetches are external API calls that
    // could be slow. Use timeouts to fail fast if service is slow.

    let region, salesChannel;
    try {
      [region, salesChannel] = await Promise.all([
        withTimeout(
          getDefaultRegion(token),
          TIMEOUT_LIMITS.EXTERNAL_API,
          'Medusa default region fetch'
        ),
        withTimeout(
          getDefaultSalesChannel(token),
          TIMEOUT_LIMITS.EXTERNAL_API,
          'Medusa default sales channel fetch'
        ),
      ]);
    } catch (timeoutError) {
      console.error('[Admin] Medusa config fetch timed out:', timeoutError);
      return badRequest('Medusa service is currently slow. Please try again.');
    }

    if (!region || !salesChannel) {
      console.error('[Admin] Missing Medusa configuration:', { region: !!region, salesChannel: !!salesChannel });
      return badRequest('Unable to retrieve Medusa configuration (region/sales channel)');
    }

    // Format product data for Medusa v2
    // Convert null values to undefined for optional fields
    const productData = formatProductForMedusa(
      {
        title,
        description: description || undefined,
        handle: handle || undefined,
        price,
        sku: sku || undefined,
        thumbnail: thumbnail || undefined,
        category_ids,
      },
      region.id,
      salesChannel.id
    );

    // ====================================================================
    // Create Product with Timeout Protection
    // ====================================================================

    let response: Response;
    try {
      response = await withTimeout(
        fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa product creation'
      );
    } catch (timeoutError) {
      console.error('[Admin] Medusa product creation timed out:', timeoutError);
      return badRequest('Product creation timed out. Please try again.');
    }

    if (!response.ok) {
      let errorMessage = 'Failed to create product in Medusa';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response body isn't JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // ====================================================================
    // Cache Invalidation and Revalidation
    // ====================================================================

    try {
      await cache.invalidate(CACHE_KEYS.products());
    } catch (cacheError) {
      console.warn('[Admin] Failed to invalidate products cache:', cacheError);
      // Don't fail - cache invalidation is best-effort
    }

    // Revalidate shop page so new product appears immediately
    revalidatePath('/shop');

    return NextResponse.json(
      {
        success: true,
        product: data.product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Admin Products POST');
  }
}

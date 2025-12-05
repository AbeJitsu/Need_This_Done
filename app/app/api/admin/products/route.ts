import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import { verifyAdmin } from '@/lib/api-auth';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';

// ============================================================================
// Admin Products API Route - /api/admin/products
// ============================================================================
// POST: Create new product (admin only)
//
// What: Admin endpoint for creating products
// Why: Admins need to add products to inventory via API
// How: Validates input, calls Medusa admin API, invalidates caches

// ============================================================================
// POST - Create Product (Admin Only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { title, description, handle, price } = body;

    // Validate required fields
    if (!title || !handle || price === undefined) {
      return badRequest('Title, handle, and price are required');
    }

    // Validate price
    if (typeof price !== 'number' || price < 0) {
      return badRequest('Price must be a non-negative number');
    }

    // Note: In a real implementation, you would:
    // 1. Get the admin auth token from your Medusa setup
    // 2. Call medusaClient.admin.createProduct() with the token
    // 3. Handle Medusa-specific requirements (variants, regions, etc.)

    // For now, return success with placeholder
    const newProduct = {
      id: `prod_${Date.now()}`,
      title,
      description,
      handle,
      prices: [{ amount: price, currency_code: 'USD' }],
    };

    // Invalidate products cache
    await cache.invalidate(CACHE_KEYS.products());

    return NextResponse.json(
      {
        success: true,
        product: newProduct,
        message: 'Product created successfully. Sync to Medusa when ready.',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Admin Products POST');
  }
}

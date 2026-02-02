import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/api-auth';
import { badRequest, handleApiError, notFound } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';
import {
  getMedusaAdminToken,
  formatProductUpdateForMedusa,
} from '@/lib/medusa-helpers';

export const dynamic = 'force-dynamic';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;

// ============================================================================
// Admin Product by ID API Route - /api/admin/products/[id]
// ============================================================================
// PUT: Update existing product (admin only)
// DELETE: Delete product (admin only)
//
// What: Admin endpoints for managing individual products via Medusa API
// Why: Admins need to edit and delete products without Medusa admin dashboard
// How: Authenticates with Medusa, calls admin API endpoints

// ============================================================================
// PUT - Update Product (Admin Only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = params;

    if (!id) {
      return badRequest('Product ID is required');
    }

    const body = await request.json();
    const { title, description, handle, price, thumbnail, category_ids } = body;

    // Validate that at least one field is being updated
    if (!title && !description && !handle && price === undefined && !thumbnail && !category_ids) {
      return badRequest('At least one field must be provided for update');
    }

    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return badRequest('Price must be a non-negative number');
    }

    // Get Medusa admin token
    const token = await getMedusaAdminToken();

    // Format update data
    const { productUpdate, priceUpdate } = formatProductUpdateForMedusa({
      title,
      description,
      handle,
      price,
      thumbnail,
      category_ids,
    });

    // Update product in Medusa with timeout protection
    const response = await withTimeout(
      fetch(`${MEDUSA_BACKEND_URL}/admin/products/${id}`, {
        method: 'POST', // Medusa v2 uses POST for updates
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productUpdate),
      }),
      TIMEOUT_LIMITS.EXTERNAL_API,
      'Medusa product fetch'
    );

    if (!response.ok) {
      if (response.status === 404) {
        return notFound('Product not found');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to update product' }));
      throw new Error(error.message || 'Failed to update product in Medusa');
    }

    const data = await response.json();

    // If price was updated, we need to update the variant price separately
    // For simplicity, we'll update the first variant's first price
    if (priceUpdate !== undefined && data.product?.variants?.[0]?.id) {
      const variantId = data.product.variants[0].id;
      const variantPrices = data.product.variants[0].prices || [];
      const usdPrice = variantPrices.find((p: { currency_code: string }) => p.currency_code === 'usd');

      if (usdPrice) {
        // Update existing price with timeout protection
        try {
          await withTimeout(
            fetch(
              `${MEDUSA_BACKEND_URL}/admin/products/${id}/variants/${variantId}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prices: variantPrices.map((p: { id: string; currency_code: string; amount: number }) =>
                    p.currency_code === 'usd'
                      ? { ...p, amount: priceUpdate }
                      : p
                  ),
                }),
              }
            ),
            TIMEOUT_LIMITS.EXTERNAL_API,
            'Medusa variant price update'
          );
        } catch (error) {
          // Log the error but don't fail the entire operation if variant update times out
          console.error('Warning: Variant price update timed out or failed:', error);
        }
      }
    }

    // Invalidate products cache
    await cache.invalidate(CACHE_KEYS.products());

    // Revalidate shop page so updated product appears immediately
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      product: data.product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    // Handle timeout errors with appropriate status code
    if (error instanceof TimeoutError) {
      return NextResponse.json(
        { error: 'Product update timed out. Medusa backend is currently slow. Please try again.' },
        { status: 503 }
      );
    }
    return handleApiError(error, 'Admin Product PUT');
  }
}

// ============================================================================
// DELETE - Delete Product (Admin Only)
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = params;

    if (!id) {
      return badRequest('Product ID is required');
    }

    // Get Medusa admin token
    const token = await getMedusaAdminToken();

    // Delete product from Medusa with timeout protection
    const response = await withTimeout(
      fetch(`${MEDUSA_BACKEND_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      TIMEOUT_LIMITS.EXTERNAL_API,
      'Medusa product delete'
    );

    if (!response.ok) {
      if (response.status === 404) {
        return notFound('Product not found');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to delete product' }));
      throw new Error(error.message || 'Failed to delete product from Medusa');
    }

    // Invalidate products cache
    await cache.invalidate(CACHE_KEYS.products());

    // Revalidate shop page so deleted product is removed immediately
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    // Handle timeout errors with appropriate status code
    if (error instanceof TimeoutError) {
      return NextResponse.json(
        { error: 'Product delete timed out. Medusa backend is currently slow. Please try again.' },
        { status: 503 }
      );
    }
    return handleApiError(error, 'Admin Product DELETE');
  }
}

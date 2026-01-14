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
// How: Authenticates with Medusa, calls admin API endpoints

// ============================================================================
// GET - List All Products (Admin Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // Get Medusa admin token
    const token = await getMedusaAdminToken();

    // Fetch products from Medusa
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/admin/products`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
      throw new Error(error.message || 'Failed to fetch products from Medusa');
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

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { title, description, handle, price, sku, thumbnail, category_ids } = body;

    // Validate required fields
    if (!title || price === undefined) {
      return badRequest('Title and price are required');
    }

    // Validate price
    if (typeof price !== 'number' || price < 0) {
      return badRequest('Price must be a non-negative number');
    }

    // Get Medusa admin token
    const token = await getMedusaAdminToken();

    // Get default region and sales channel for product creation
    const [region, salesChannel] = await Promise.all([
      getDefaultRegion(token),
      getDefaultSalesChannel(token),
    ]);

    if (!region || !salesChannel) {
      throw new Error('Failed to get required Medusa configuration (region/sales channel)');
    }

    // Format product data for Medusa v2
    const productData = formatProductForMedusa(
      {
        title,
        description,
        handle,
        price,
        sku,
        thumbnail,
        category_ids,
      },
      region.id,
      salesChannel.id
    );

    // Create product in Medusa
    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create product' }));
      throw new Error(error.message || 'Failed to create product in Medusa');
    }

    const data = await response.json();

    // Invalidate products cache
    await cache.invalidate(CACHE_KEYS.products());

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

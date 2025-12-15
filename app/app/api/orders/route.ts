import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { medusaClient } from '@/lib/medusa-client';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { verifyAuth } from '@/lib/api-auth';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// ============================================================================
// Orders API Route - /api/orders
// ============================================================================
// GET: List user's orders or get specific order by ID
// What: Provides order history and tracking
// Why: Users need to see past orders and track shipments
// How: Queries Supabase for user's orders, fetches details from Medusa

// ============================================================================
// GET - Retrieve Order(s)
// ============================================================================
// Query params:
//   - id: Get specific order by ID
//   - (no params): List all orders for authenticated user
//   - email: List orders by email (guest orders)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const email = searchParams.get('email');

    // Case 1: Get specific order by ID
    if (orderId) {
      return await handleGetOrder(orderId);
    }

    // Case 2: List orders for authenticated user
    if (!email) {
      return await handleListUserOrders();
    }

    // Case 3: List guest orders by email (public endpoint)
    return await handleListGuestOrders(email);
  } catch (error) {
    return handleApiError(error, 'Orders GET');
  }
}

// ============================================================================
// Case 1: Get Specific Order
// ============================================================================

async function handleGetOrder(orderId: string) {
  if (!orderId) {
    return badRequest('Order ID is required');
  }

  try {
    const result = await cache.wrap(
      CACHE_KEYS.order(orderId),
      async () => {
        return await medusaClient.orders.get(orderId);
      },
      CACHE_TTL.LONG // 5 minutes
    );

    return NextResponse.json({
      order: result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Get Order');
  }
}

// ============================================================================
// Case 2: List User's Orders (Authenticated)
// ============================================================================

async function handleListUserOrders() {
  try {
    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;

    const userId = authResult.user.id;
    const supabase = await createSupabaseServerClient();

    const result = await cache.wrap(
      CACHE_KEYS.userOrders(userId),
      async () => {
        // Get orders linked to this user from Supabase
        const { data: userOrders, error } = await supabase
          .from('orders')
          .select('medusa_order_id, total, status, email, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch user orders from Supabase:', error);
          return [];
        }

        return userOrders || [];
      },
      CACHE_TTL.MEDIUM // 1 minute
    );

    return NextResponse.json({
      orders: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'List User Orders');
  }
}

// ============================================================================
// Case 3: List Guest Orders by Email (Public)
// ============================================================================

async function handleListGuestOrders(email: string) {
  if (!email) {
    return badRequest('Email is required');
  }

  // Validate email format to prevent injection attacks
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return badRequest('Invalid email format');
  }

  try {
    const result = await cache.wrap(
      `medusa:orders:email:${email}`,
      async () => {
        return await medusaClient.orders.listByEmail(email);
      },
      CACHE_TTL.MEDIUM // 1 minute
    );

    return NextResponse.json({
      orders: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'List Guest Orders');
  }
}

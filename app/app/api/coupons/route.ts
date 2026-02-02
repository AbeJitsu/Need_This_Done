import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';

// ============================================================================
// Coupons API - /api/coupons
// ============================================================================
// What: Validates and applies discount codes
// Why: Enable promotional offers and customer incentives
// How: Check coupon validity, calculate discounts, track usage
//
// Endpoints:
// - GET: Validate a coupon code
// - POST: Apply a coupon to an order

export const dynamic = 'force-dynamic';

// ============================================================================
// Types
// ============================================================================

interface CouponValidationResult {
  valid: boolean;
  coupon_id?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  error?: string;
}

// ============================================================================
// GET - Validate Coupon
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // Get coupon code
    const code = searchParams.get('code');
    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Get cart context
    const cartTotal = parseInt(searchParams.get('cart_total') || '0');
    const itemCount = parseInt(searchParams.get('item_count') || '0');
    const isFirstOrder = searchParams.get('first_order') === 'true';

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Validate coupon with timeout protection
    let response;
    try {
      response = await withTimeout(
        supabase.rpc('validate_coupon', {
          p_code: code,
          p_cart_total: cartTotal,
          p_item_count: itemCount,
          p_user_id: user?.id || null,
          p_email: user?.email || null,
          p_is_first_order: isFirstOrder,
        }) as any,
        TIMEOUT_LIMITS.DATABASE,
        'Validate coupon in database'
      );
    } catch (timeoutErr) {
      if (timeoutErr instanceof TimeoutError) {
        console.error('[Coupons] Database timeout:', timeoutErr.message);
        return NextResponse.json(
          { error: 'Coupon validation is temporarily slow. Please try again.' },
          { status: 503 }
        );
      }
      throw timeoutErr;
    }

    const { data, error } = response as { data: unknown; error: unknown };

    if (error) {
      console.error('Coupon validation error:', error);
      return NextResponse.json(
        { error: 'Failed to validate coupon' },
        { status: 500 }
      );
    }

    const result = (data as CouponValidationResult[] | null)?.[0];

    if (!result) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' }
      );
    }

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        error: result.error || 'Invalid coupon code',
      });
    }

    return NextResponse.json({
      valid: true,
      coupon_id: result.coupon_id,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
      discount_amount: result.discount_amount,
      message: formatDiscountMessage(result),
    });
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Apply Coupon
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    // Validate required fields
    if (!body.coupon_id) {
      return NextResponse.json(
        { error: 'coupon_id is required' },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Apply the coupon with timeout protection
    let response;
    try {
      response = await withTimeout(
        supabase.rpc('apply_coupon', {
          p_coupon_id: body.coupon_id,
          p_user_id: user?.id || null,
          p_order_id: body.order_id || null,
          p_discount_applied: body.discount_applied || 0,
          p_order_total: body.order_total || 0,
          p_email: body.email || user?.email || null,
        }) as any,
        TIMEOUT_LIMITS.DATABASE,
        'Apply coupon in database'
      );
    } catch (timeoutErr) {
      if (timeoutErr instanceof TimeoutError) {
        console.error('[Coupons] Database timeout:', timeoutErr.message);
        return NextResponse.json(
          { error: 'Coupon application is temporarily slow. Please try again.' },
          { status: 503 }
        );
      }
      throw timeoutErr;
    }

    const { data, error } = response as { data: unknown; error: unknown };

    if (error) {
      console.error('Coupon application error:', error);
      return NextResponse.json(
        { error: 'Failed to apply coupon' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to apply coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Coupons POST error:', error);
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDiscountMessage(result: CouponValidationResult): string {
  if (!result.valid) return '';

  const { discount_type, discount_value, discount_amount } = result;

  switch (discount_type) {
    case 'percentage':
      return `${discount_value}% off applied! You save $${((discount_amount || 0) / 100).toFixed(2)}`;

    case 'fixed_amount':
      return `$${discount_value?.toFixed(2)} off applied!`;

    case 'free_shipping':
      return 'Free shipping applied!';

    case 'buy_x_get_y':
      return 'Buy more, save more discount applied!';

    default:
      return 'Discount applied!';
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import { badRequest, handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Check Appointment Requirement API Route - /api/checkout/check-appointment
// ============================================================================
// POST: Check if cart contains products that require appointment scheduling
//
// What: Inspects cart items for appointment-required products
// Why: Determines if checkout flow needs appointment step before payment
// How: Checks product metadata for requires_appointment flag

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_id } = body;

    // Validate required fields
    if (!cart_id) {
      return badRequest('cart_id is required');
    }

    // Fetch cart to check for appointment-required products
    let requiresAppointment = false;
    let serviceName = 'Consultation';
    let durationMinutes = 30;

    try {
      const cart = await medusaClient.carts.get(cart_id);

      // Find first appointment-required item for service details
      // Note: Medusa v1 with expand=items.variant.product puts product at item.variant.product
      const appointmentItem = cart.items?.find((item) => {
        // Check both possible locations - Medusa v1 nests product under variant
        const metadata =
          (item.variant as { product?: { metadata?: Record<string, unknown> } })?.product
            ?.metadata || item.product?.metadata;
        const flag = metadata?.requires_appointment;
        // Handle both boolean true and string "true"
        return flag === true || flag === 'true';
      });

      if (appointmentItem) {
        requiresAppointment = true;

        // Get product from either location
        const product =
          (appointmentItem.variant as { product?: { title?: string; metadata?: Record<string, unknown> } })?.product ||
          appointmentItem.product;

        // Extract service name and duration from product
        serviceName = product?.title || 'Consultation';

        // Try to extract duration from metadata or parse from title
        const metadata = product?.metadata;
        if (metadata?.duration_minutes) {
          durationMinutes = Number(metadata.duration_minutes);
        } else {
          // Parse duration from title like "30-Minute Strategy Consultation"
          const match = serviceName.match(/(\d+)-?(?:minute|min)/i);
          if (match) {
            durationMinutes = parseInt(match[1], 10);
          }
        }
      }
    } catch (error) {
      // Log cart fetch failure as a warning since this is critical for checkout flow
      // Silent degradation would let checkout proceed without required appointment steps
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('[Check Appointment] Failed to fetch cart for appointment check:', {
        cart_id,
        error: errorMessage,
        severity: 'warning',
        impact: 'Checkout will proceed without appointment requirement check',
      });

      // Return error instead of silently degrading
      // The client can decide whether to proceed without appointment verification
      return NextResponse.json(
        {
          error: 'Unable to verify appointment requirements. Please try again.',
          code: 'CART_FETCH_FAILED',
          retryable: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      requires_appointment: requiresAppointment,
      service_name: requiresAppointment ? serviceName : null,
      duration_minutes: requiresAppointment ? durationMinutes : null,
    });
  } catch (error) {
    return handleApiError(error, 'Check Appointment POST');
  }
}

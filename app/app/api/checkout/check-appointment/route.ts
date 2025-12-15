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
      const appointmentItem = cart.items?.find(
        (item) => item.product?.metadata?.requires_appointment === true
      );

      if (appointmentItem) {
        requiresAppointment = true;

        // Extract service name and duration from product
        serviceName = appointmentItem.product?.title || 'Consultation';

        // Try to extract duration from metadata or parse from title
        if (appointmentItem.product?.metadata?.duration_minutes) {
          durationMinutes = Number(appointmentItem.product.metadata.duration_minutes);
        } else {
          // Parse duration from title like "30-Minute Strategy Consultation"
          const match = serviceName.match(/(\d+)-?(?:minute|min)/i);
          if (match) {
            durationMinutes = parseInt(match[1], 10);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart for appointment check:', error);
      // Return false if cart fetch fails - let checkout proceed normally
      return NextResponse.json({
        requires_appointment: false,
        service_name: null,
        duration_minutes: null,
      });
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

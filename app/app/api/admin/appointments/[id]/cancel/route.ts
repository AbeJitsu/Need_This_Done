import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { deleteCalendarEvent, isCalendarConnected, getValidAccessToken } from '@/lib/google-calendar';
import { sendAppointmentCancellation } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// Cancel Appointment API - POST /api/admin/appointments/[id]/cancel
// ============================================================================
// What: Cancels a pending or approved appointment request
// Why: Admin needs to cancel appointments that can't be fulfilled
// How: Updates status, deletes calendar event if exists, notifies customer

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use singleton admin client
    const supabase = getSupabaseAdmin();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch the appointment request
    const { data: appointment, error: fetchError } = await supabase
      .from('appointment_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment request not found' },
        { status: 404 }
      );
    }

    if (appointment.status === 'canceled') {
      return NextResponse.json(
        { error: 'Appointment is already canceled' },
        { status: 400 }
      );
    }

    // Delete Google Calendar event if it exists
    if (appointment.google_event_id) {
      const calendarConnected = await isCalendarConnected(user.id);
      if (calendarConnected) {
        try {
          const accessToken = await getValidAccessToken(user.id);
          await deleteCalendarEvent(accessToken, appointment.google_event_id);
        } catch (calendarError) {
          console.error('[Cancel Appointment] Calendar event deletion failed:', calendarError);
          // Continue with cancellation even if calendar deletion fails
        }
      }
    }

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointment_requests')
      .update({
        status: 'canceled',
        google_event_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Cancel Appointment] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    // Send cancellation email to customer
    let emailSent = false;
    let emailError: string | null = null;
    try {
      const preferredDate = new Date(appointment.preferred_date);
      const formattedDate = preferredDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = `${appointment.preferred_time_start} - ${appointment.preferred_time_end}`;

      await sendAppointmentCancellation({
        customerEmail: appointment.customer_email,
        customerName: appointment.customer_name || undefined,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        serviceName: appointment.service_name || 'Consultation',
        orderId: appointment.order_id,
      });
      emailSent = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Cancel Appointment] Email send failed:', err);
      // Log failure for admin visibility - cancellation still succeeds but customer may not be notified
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabase');
        const supabase = getSupabaseAdmin();
        await supabase.from('email_failures').insert({
          type: 'appointment_cancellation',
          recipient_email: appointment.customer_email,
          subject: `Appointment Cancellation Confirmation: ${appointment.service_name || 'Consultation'}`,
          order_id: appointment.order_id,
          error_message: emailError,
          created_at: new Date().toISOString(),
        });
      } catch {
        // Silent fail if logging fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment canceled successfully',
      email_sent: emailSent,
      email_error: emailError,
    });

  } catch (error) {
    console.error('[Cancel Appointment] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

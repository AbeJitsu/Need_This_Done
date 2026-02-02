import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendAppointmentConfirmation } from '@/lib/email-service';
import { createCalendarEvent, isCalendarConnected, generateIcsContent, getValidAccessToken } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// ============================================================================
// Approve Appointment API - POST /api/admin/appointments/[id]/approve
// ============================================================================
// What: Approves a pending appointment request
// Why: Admin needs to confirm appointments after reviewing
// How: Updates status, creates calendar event (if connected), sends confirmation email

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

    if (appointment.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve appointment with status: ${appointment.status}` },
        { status: 400 }
      );
    }

    // Try to create Google Calendar event if connected
    let googleEventId: string | null = null;
    let calendarError: string | null = null;
    const calendarConnected = await isCalendarConnected(user.id);

    if (calendarConnected) {
      try {
        // Get access token for the admin user (handles token refresh automatically)
        const accessToken = await getValidAccessToken(user.id);

        // Combine date and time for start
        const startDateTime = new Date(`${appointment.preferred_date}T${appointment.preferred_time_start}`);

        const calendarEvent = await createCalendarEvent(accessToken, {
          summary: `Consultation with ${appointment.customer_name || appointment.customer_email}`,
          description: `Order ID: ${appointment.order_id}\nCustomer: ${appointment.customer_email}\n\n${appointment.notes || 'No additional notes.'}`,
          startDateTime,
          durationMinutes: appointment.duration_minutes,
          attendeeEmail: appointment.customer_email,
        });

        googleEventId = calendarEvent.id || null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Approve Appointment] Calendar event creation failed:', errorMessage);

        // Capture error message to return to admin
        if (errorMessage.includes('No Google Calendar connection found')) {
          calendarError = 'Calendar disconnected. Please reconnect in Settings.';
        } else if (errorMessage.includes('Token refresh failed')) {
          calendarError = 'Calendar authorization expired. Please reconnect in Settings.';
        } else {
          calendarError = 'Failed to create calendar event. Check Settings.';
        }

        // Continue without calendar event - we'll still approve the appointment
      }
    }

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointment_requests')
      .update({
        status: 'approved',
        google_event_id: googleEventId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Approve Appointment] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve appointment' },
        { status: 500 }
      );
    }

    // Format date for email
    const appointmentDate = new Date(appointment.preferred_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format time for email
    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const appointmentTime = `${formatTime(appointment.preferred_time_start)} - ${formatTime(appointment.preferred_time_end)}`;

    // Generate ICS content for calendar invite
    const startDate = new Date(`${appointment.preferred_date}T${appointment.preferred_time_start}`);
    const endDate = new Date(`${appointment.preferred_date}T${appointment.preferred_time_end}`);

    const icsContent = generateIcsContent(
      `Consultation - NeedThisDone`,
      `Your ${appointment.duration_minutes}-minute consultation has been confirmed.`,
      startDate,
      endDate,
      undefined, // location
      undefined, // organizerEmail
      appointment.customer_email
    );

    // Send confirmation email with proper error tracking
    let emailSent = false;
    let emailError: string | null = null;

    try {
      await sendAppointmentConfirmation({
        customerEmail: appointment.customer_email,
        customerName: appointment.customer_name || undefined,
        serviceName: 'Consultation',
        appointmentDate,
        appointmentTime,
        durationMinutes: appointment.duration_minutes,
        orderId: appointment.order_id,
        meetingLink: undefined,
        notes: appointment.notes || undefined,
      }, icsContent);

      emailSent = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Approve Appointment] Failed to send confirmation email:', errorMessage);
      emailError = 'Failed to send confirmation email';
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment approved successfully',
      google_event_created: !!googleEventId,
      calendar_error: calendarError,
      email_sent: emailSent,
      email_error: emailError,
    });

  } catch (error) {
    console.error('[Approve Appointment] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

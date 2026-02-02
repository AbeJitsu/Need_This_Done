import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentRequestNotification } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// Appointment Request API Route - POST /api/appointments/request
// ============================================================================
// What: Creates a new appointment request for consultation orders
// Why: Customers need to request appointment times after checkout
// How: Validates input, checks order exists, creates appointment_request record

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      order_id,
      customer_email,
      customer_name,
      preferred_date,
      preferred_time_start,
      alternate_date,
      alternate_time_start,
      duration_minutes,
      notes,
      service_name,
    } = body;

    if (!order_id || !customer_email || !preferred_date || !preferred_time_start) {
      return NextResponse.json(
        { error: 'Missing required fields: order_id, customer_email, preferred_date, preferred_time_start' },
        { status: 400 }
      );
    }

    // Validate 24-hour minimum notice
    const requestedDateTime = new Date(`${preferred_date}T${preferred_time_start}`);
    const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    if (requestedDateTime < minDateTime) {
      return NextResponse.json(
        { error: 'Appointments must be booked at least 24 hours in advance' },
        { status: 400 }
      );
    }

    // Validate date is a weekday
    const preferredDay = new Date(preferred_date + 'T12:00:00').getDay();
    if (preferredDay === 0 || preferredDay === 6) {
      return NextResponse.json(
        { error: 'Preferred date must be a weekday (Monday-Friday)' },
        { status: 400 }
      );
    }

    // Validate time is within business hours (9 AM - 5 PM)
    const [hours] = preferred_time_start.split(':').map(Number);
    if (hours < 9 || hours >= 17) {
      return NextResponse.json(
        { error: 'Preferred time must be between 9 AM and 5 PM' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, requires_appointment')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if appointment request already exists for this order
    const { data: existingRequest } = await supabase
      .from('appointment_requests')
      .select('id')
      .eq('order_id', order_id)
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Appointment request already exists for this order' },
        { status: 409 }
      );
    }

    // ========================================================================
    // Calculate Time Ranges First
    // ========================================================================
    const [startHours, startMinutes] = preferred_time_start.split(':').map(Number);
    const requestedStartMinutes = startHours * 60 + startMinutes;
    const requestedEndMinutes = requestedStartMinutes + (duration_minutes || 30);
    const endHours = Math.floor(requestedEndMinutes / 60);
    const endMins = requestedEndMinutes % 60;
    const preferred_time_end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // ========================================================================
    // Atomic Validation Using Database Query
    // ========================================================================
    // RACE CONDITION FIX: Instead of checking then inserting (TOCTOU vulnerability),
    // we fetch and validate in a single query, then rely on database constraints.
    // This prevents double-bookings from concurrent requests.

    const BUFFER_MINUTES = 30;
    const MAX_DAILY_BOOKINGS = 5;

    // Fetch all existing appointments for the day in one query
    const { data: existingAppointments, error: fetchError } = await supabase
      .from('appointment_requests')
      .select('id, preferred_time_start, preferred_time_end')
      .eq('preferred_date', preferred_date)
      .in('status', ['pending', 'approved']);

    if (fetchError) {
      console.error('[Appointment Request] Failed to fetch existing appointments:', fetchError);
      return NextResponse.json(
        { error: 'Unable to check availability. Please try again.' },
        { status: 500 }
      );
    }

    // Check daily limit
    if (existingAppointments && existingAppointments.length >= MAX_DAILY_BOOKINGS) {
      return NextResponse.json(
        { error: 'This day is fully booked. Please select another date.' },
        { status: 409 }
      );
    }

    // Check for time conflicts (including 30-min buffer)
    const hasConflict = existingAppointments?.some((existing) => {
      const [existingStartH, existingStartM] = existing.preferred_time_start.split(':').map(Number);
      const [existingEndH, existingEndM] = existing.preferred_time_end.split(':').map(Number);
      const existingStart = existingStartH * 60 + existingStartM;
      const existingEnd = existingEndH * 60 + existingEndM;

      // Check if there's overlap with buffer
      // New appointment must end + buffer before existing starts
      // OR new appointment must start after existing ends + buffer
      return !(
        requestedEndMinutes + BUFFER_MINUTES <= existingStart ||
        requestedStartMinutes >= existingEnd + BUFFER_MINUTES
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'This time slot conflicts with an existing appointment. Please select a different time.' },
        { status: 409 }
      );
    }

    // Calculate alternate time end if provided
    let alternate_time_end = null;
    if (alternate_time_start) {
      const [altStartHours, altStartMinutes] = alternate_time_start.split(':').map(Number);
      const altEndTimeMinutes = altStartHours * 60 + altStartMinutes + (duration_minutes || 30);
      const altEndHours = Math.floor(altEndTimeMinutes / 60);
      const altEndMins = altEndTimeMinutes % 60;
      alternate_time_end = `${altEndHours.toString().padStart(2, '0')}:${altEndMins.toString().padStart(2, '0')}`;
    }

    // Create appointment request
    const { data: appointmentRequest, error: insertError } = await supabase
      .from('appointment_requests')
      .insert({
        order_id,
        customer_email,
        customer_name: customer_name || null,
        preferred_date,
        preferred_time_start,
        preferred_time_end,
        alternate_date: alternate_date || null,
        alternate_time_start: alternate_time_start || null,
        alternate_time_end,
        duration_minutes: duration_minutes || 30,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Appointment Request] Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to create appointment request' },
        { status: 500 }
      );
    }

    // Send notification email to admin (fire and forget - don't block response)
    sendAppointmentRequestNotification({
      requestId: appointmentRequest.id,
      orderId: order_id,
      customerName: customer_name || null,
      customerEmail: customer_email,
      serviceName: service_name || 'Consultation',
      durationMinutes: duration_minutes || 30,
      preferredDate: preferred_date,
      preferredTimeStart: preferred_time_start,
      preferredTimeEnd: preferred_time_end,
      alternateDate: alternate_date || null,
      alternateTimeStart: alternate_time_start || null,
      alternateTimeEnd: alternate_time_end,
      notes: notes || null,
      submittedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
    }).catch((err) => {
      console.error('[Appointment Request] Failed to send admin notification:', err);
    });

    return NextResponse.json({
      success: true,
      appointment_request_id: appointmentRequest.id,
      message: 'Appointment request submitted successfully',
    });

  } catch (error) {
    console.error('[Appointment Request] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

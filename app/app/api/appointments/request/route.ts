import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentRequestNotification } from '@/lib/email-service';

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

    // Validate date is a weekday
    const preferredDay = new Date(preferred_date).getDay();
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

    // Calculate preferred time end
    const [startHours, startMinutes] = preferred_time_start.split(':').map(Number);
    const endTimeMinutes = startHours * 60 + startMinutes + (duration_minutes || 30);
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMins = endTimeMinutes % 60;
    const preferred_time_end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

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

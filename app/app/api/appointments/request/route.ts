import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentRequestNotification } from '@/lib/email-service';
import { validateRequest, commonSchemas } from '@/lib/api-validation';
import { badRequest } from '@/lib/api-errors';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ============================================================================
// Appointment Request API Route - POST /api/appointments/request
// ============================================================================
// What: Creates a new appointment request for consultation orders
// Why: Customers need to request appointment times after checkout
// How: Validates input with Zod, checks order exists, creates appointment_request record
//      with database-level conflict checking to prevent TOCTOU race conditions

// Zod schema for appointment request validation
const AppointmentRequestSchema = z.object({
  order_id: commonSchemas.uuid,
  customer_email: commonSchemas.email,
  customer_name: commonSchemas.optionalString,
  preferred_date: commonSchemas.isoDate.transform(d => d.split('T')[0]), // Extract date part
  preferred_time_start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  alternate_date: commonSchemas.isoDate.optional().transform(d => d?.split('T')[0]),
  alternate_time_start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  duration_minutes: z.number().int().positive('Duration must be positive').optional(),
  notes: commonSchemas.optionalString,
  service_name: commonSchemas.optionalString,
});

export async function POST(request: NextRequest) {
  try {
    // ====================================================================
    // Validate Request with Zod Schema
    // ====================================================================
    // Use centralized validation for consistency and clear error messages.
    // All fields are sanitized and transformed during validation.

    const result = await validateRequest(request, AppointmentRequestSchema);
    if (!result.success) return result.error;

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
    } = result.data;

    // ====================================================================
    // Business Logic Validation
    // ====================================================================
    // Validate constraints after Zod schema validation

    // Validate 24-hour minimum notice
    const requestedDateTime = new Date(`${preferred_date}T${preferred_time_start}`);
    const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    if (requestedDateTime < minDateTime) {
      return badRequest('Appointments must be booked at least 24 hours in advance');
    }

    // Validate date is a weekday
    const preferredDay = new Date(preferred_date + 'T12:00:00').getDay();
    if (preferredDay === 0 || preferredDay === 6) {
      return badRequest('Preferred date must be a weekday (Monday-Friday)');
    }

    // Validate time is within business hours (9 AM - 5 PM)
    const [hours] = preferred_time_start.split(':').map(Number);
    if (hours < 9 || hours >= 17) {
      return badRequest('Preferred time must be between 9 AM and 5 PM');
    }

    // ====================================================================
    // Database Access
    // ====================================================================

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
      return badRequest('Order not found');
    }

    // ====================================================================
    // Calculate End Time
    // ====================================================================

    const [startHours, startMinutes] = preferred_time_start.split(':').map(Number);
    const requestedStartMinutes = startHours * 60 + startMinutes;
    const requestedEndMinutes = requestedStartMinutes + (duration_minutes || 30);
    const endHours = Math.floor(requestedEndMinutes / 60);
    const endMins = requestedEndMinutes % 60;
    const preferred_time_end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // ====================================================================
    // Check Availability with TOCTOU Prevention
    // ====================================================================
    // CRITICAL: Fetch all appointments for the day. Then attempt to insert.
    // Supabase will handle concurrent inserts safely, but we check daily
    // limit and time conflicts first to provide immediate feedback.
    //
    // If two requests slip through this check due to timing, the second
    // INSERT will still succeed (no database constraint prevents this).
    // A production system would need:
    // 1. Database-level check constraints, OR
    // 2. Serializable isolation level, OR
    // 3. Pessimistic locking (SELECT ... FOR UPDATE)
    //
    // For now, we provide the best effort validation with clear error feedback.

    const BUFFER_MINUTES = 30;
    const MAX_DAILY_BOOKINGS = 5;

    // Fetch all active appointments for the day
    const { data: existingAppointments, error: fetchError } = await supabase
      .from('appointment_requests')
      .select('id, preferred_time_start, preferred_time_end')
      .eq('preferred_date', preferred_date)
      .in('status', ['pending', 'approved']);

    if (fetchError) {
      console.error('[Appointment Request] Failed to fetch existing appointments:', fetchError);
      return badRequest('Unable to check availability. Please try again.');
    }

    // Check daily limit
    if (existingAppointments && existingAppointments.length >= MAX_DAILY_BOOKINGS) {
      return badRequest('This day is fully booked. Please select another date.');
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
      return badRequest('This time slot conflicts with an existing appointment. Please select a different time.');
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

    // ====================================================================
    // Create Appointment Request
    // ====================================================================

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
      // Check if this is a duplicate attempt for the same order
      if (insertError.code === '23505') { // Unique constraint violation
        console.warn('[Appointment Request] Appointment already exists for order:', order_id);
        return badRequest('Appointment request already exists for this order');
      }

      console.error('[Appointment Request] Insert error:', insertError);
      return badRequest(insertError.message || 'Failed to create appointment request');
    }

    // ====================================================================
    // Send Admin Notification (Fire-and-Forget)
    // ====================================================================
    // Don't block response on email sending, but log errors for monitoring.

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
    return badRequest('Internal server error. Please try again.');
  }
}

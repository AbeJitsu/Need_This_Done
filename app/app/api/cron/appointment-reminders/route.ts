import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendEmailWithRetry } from '@/lib/email';

// ============================================================================
// Appointment Reminders Cron Job - /api/cron/appointment-reminders
// ============================================================================
// What: Sends reminder emails to customers before upcoming appointments
// Why: Reduce no-shows and improve customer experience
// How: Runs on schedule, finds upcoming approved appointments, sends reminders
//
// Schedule: Recommended every hour via Vercel Cron
// Protection: Requires CRON_SECRET header to prevent unauthorized access
// Reminders: 24 hours and 1 hour before appointment time

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

// ============================================================================
// Types
// ============================================================================

interface ReminderResult {
  appointment_id: string;
  reminder_type: '24h' | '1h';
  sent: boolean;
  email_id?: string;
  error?: string;
}

// ============================================================================
// POST - Process Appointment Reminders
// ============================================================================
// Called by Vercel Cron or manually for testing

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, CRON_SECRET must be configured
      console.error('[Cron] CRON_SECRET not configured in production');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

    // Find appointments needing reminders
    const remindersToSend = await findAppointmentsNeedingReminders(supabase);

    if (remindersToSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No appointments needing reminders',
        processed: 0,
        sent: 0,
      });
    }

    // Process each reminder
    const results: ReminderResult[] = [];
    let sent = 0;
    let errors = 0;

    for (const reminder of remindersToSend) {
      try {
        const emailId = await sendAppointmentReminder(
          supabase,
          reminder,
          siteUrl
        );

        if (emailId) {
          // Record the reminder in database
          await supabase.from('appointment_reminders').insert({
            appointment_id: reminder.appointment_id,
            order_id: reminder.order_id,
            customer_email: reminder.customer_email,
            customer_name: reminder.customer_name,
            reminder_type: reminder.reminder_type,
            hours_before_appointment: reminder.hours_before,
            appointment_date: reminder.preferred_date,
            appointment_time: reminder.preferred_time_start,
            email_sent_at: new Date().toISOString(),
            email_delivered: true,
          });

          results.push({
            appointment_id: reminder.appointment_id,
            reminder_type: reminder.reminder_type,
            sent: true,
            email_id: emailId,
          });

          sent++;
        } else {
          results.push({
            appointment_id: reminder.appointment_id,
            reminder_type: reminder.reminder_type,
            sent: false,
            error: 'Failed to send email',
          });
          errors++;
        }
      } catch (error) {
        console.error(
          `Failed to process reminder for appointment ${reminder.appointment_id}:`,
          error
        );
        results.push({
          appointment_id: reminder.appointment_id,
          reminder_type: reminder.reminder_type,
          sent: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${remindersToSend.length} appointment reminders`,
      processed: remindersToSend.length,
      sent,
      errors,
      details: results,
    });
  } catch (error) {
    console.error('Appointment reminder cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process appointment reminders' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Check Cron Status
// ============================================================================
// Returns stats about appointment reminders

export async function GET(request: NextRequest) {
  try {
    // Require cron secret or admin auth to view stats
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Fall back to admin auth check
      const { verifyAdmin } = await import('@/lib/api-auth');
      const auth = await verifyAdmin();
      if (auth.error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (!cronSecret) {
      // No cron secret configured - require admin auth
      const { verifyAdmin } = await import('@/lib/api-auth');
      const auth = await verifyAdmin();
      if (auth.error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = await createSupabaseServerClient();

    // Get stats for today
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysReminders } = await supabase
      .from('appointment_reminders')
      .select('*')
      .gte('email_sent_at', today);

    // Get stats for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const { data: weekReminders } = await supabase
      .from('appointment_reminders')
      .select('*')
      .gte('email_sent_at', sevenDaysAgo);

    // Get breakdown by reminder type
    const reminderTypes = {
      '24h': todaysReminders?.filter(r => r.reminder_type === '24h').length || 0,
      '1h': todaysReminders?.filter(r => r.reminder_type === '1h').length || 0,
    };

    return NextResponse.json({
      todaysSummary: {
        total: todaysReminders?.length || 0,
        byType: reminderTypes,
        delivered: todaysReminders?.filter(r => r.email_delivered).length || 0,
        bounced: todaysReminders?.filter(r => r.email_bounced).length || 0,
      },
      weekSummary: {
        total: weekReminders?.length || 0,
        delivered: weekReminders?.filter(r => r.email_delivered).length || 0,
      },
      recentReminders: (todaysReminders || []).slice(0, 10),
    });
  } catch (error) {
    console.error('Appointment reminder stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment reminder stats' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper: Find Appointments Needing Reminders
// ============================================================================
// Queries for approved appointments that are coming up in 24h or 1h

interface AppointmentReminder {
  appointment_id: string;
  order_id: string;
  customer_email: string;
  customer_name: string | null;
  preferred_date: string;
  preferred_time_start: string;
  duration_minutes: number;
  notes: string | null;
  google_event_link: string | null;
  reminder_type: '24h' | '1h';
  hours_before: number;
}

async function findAppointmentsNeedingReminders(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<AppointmentReminder[]> {
  try {
    const now = new Date();
    const reminders: AppointmentReminder[] = [];

    // Find appointments approved and scheduled in next 24 hours (for 24h reminder)
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Get approved appointments for the next 24 hours
    const { data: appointmentsFor24h } = await supabase
      .from('appointment_requests')
      .select(`
        id,
        order_id,
        customer_email,
        customer_name,
        preferred_date,
        preferred_time_start,
        duration_minutes,
        notes,
        google_event_link,
        created_at
      `)
      .eq('status', 'approved')
      .not('scheduled_at', 'is', null)
      .gte('preferred_date', now.toISOString().split('T')[0])
      .lte('preferred_date', in25Hours.toISOString().split('T')[0]);

    // Get approved appointments for the next 1 hour
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: appointmentsFor1h } = await supabase
      .from('appointment_requests')
      .select(`
        id,
        order_id,
        customer_email,
        customer_name,
        preferred_date,
        preferred_time_start,
        duration_minutes,
        notes,
        google_event_link,
        created_at
      `)
      .eq('status', 'approved')
      .not('scheduled_at', 'is', null)
      .gte('preferred_date', now.toISOString().split('T')[0])
      .lte('preferred_date', in2Hours.toISOString().split('T')[0]);

    // Filter 24-hour appointments
    if (appointmentsFor24h) {
      for (const apt of appointmentsFor24h) {
        // Check if reminder already sent
        const { data: existing } = await supabase
          .from('appointment_reminders')
          .select('id')
          .eq('appointment_id', apt.id)
          .eq('reminder_type', '24h')
          .single();

        if (!existing) {
          const aptDateTime = new Date(`${apt.preferred_date}T${apt.preferred_time_start}`);
          // Only send if appointment is in 24±1 hour window
          if (aptDateTime > now && aptDateTime <= in25Hours) {
            reminders.push({
              appointment_id: apt.id,
              order_id: apt.order_id,
              customer_email: apt.customer_email,
              customer_name: apt.customer_name,
              preferred_date: apt.preferred_date,
              preferred_time_start: apt.preferred_time_start,
              duration_minutes: apt.duration_minutes,
              notes: apt.notes,
              google_event_link: apt.google_event_link,
              reminder_type: '24h',
              hours_before: 24,
            });
          }
        }
      }
    }

    // Filter 1-hour appointments
    if (appointmentsFor1h) {
      for (const apt of appointmentsFor1h) {
        // Check if reminder already sent
        const { data: existing } = await supabase
          .from('appointment_reminders')
          .select('id')
          .eq('appointment_id', apt.id)
          .eq('reminder_type', '1h')
          .single();

        if (!existing) {
          const aptDateTime = new Date(`${apt.preferred_date}T${apt.preferred_time_start}`);
          // Only send if appointment is in 1±0.5 hour window
          if (aptDateTime > in1Hour && aptDateTime <= in2Hours) {
            reminders.push({
              appointment_id: apt.id,
              order_id: apt.order_id,
              customer_email: apt.customer_email,
              customer_name: apt.customer_name,
              preferred_date: apt.preferred_date,
              preferred_time_start: apt.preferred_time_start,
              duration_minutes: apt.duration_minutes,
              notes: apt.notes,
              google_event_link: apt.google_event_link,
              reminder_type: '1h',
              hours_before: 1,
            });
          }
        }
      }
    }

    return reminders;
  } catch (error) {
    console.error('Error finding appointments needing reminders:', error);
    return [];
  }
}

// ============================================================================
// Helper: Send Appointment Reminder Email
// ============================================================================

async function sendAppointmentReminder(
  _supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  reminder: AppointmentReminder,
  _siteUrl: string
): Promise<string | null> {
  try {
    // Format appointment date and time for display
    const appointmentDate = new Date(`${reminder.preferred_date}T${reminder.preferred_time_start}`);
    const dateStr = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const timeStr = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Dynamically import the email template to avoid bundling issues
    const { default: AppointmentReminderEmail } = await import(
      '@/emails/AppointmentReminderEmail'
    );

    // Send email
    const emailId = await sendEmailWithRetry(
      reminder.customer_email,
      reminder.reminder_type === '24h'
        ? `Reminder: Your appointment tomorrow at ${timeStr}`
        : `Urgent: Your appointment is in 1 hour!`,
      AppointmentReminderEmail({
        customerEmail: reminder.customer_email,
        customerName: reminder.customer_name || undefined,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        durationMinutes: reminder.duration_minutes,
        serviceName: 'Your Scheduled Service',
        meetingLink: reminder.google_event_link || undefined,
        orderId: reminder.order_id,
        hoursUntilAppointment: reminder.hours_before,
      })
    );

    return emailId;
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return null;
  }
}

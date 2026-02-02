// ============================================================================
// Appointment Notification Tracking
// ============================================================================
// What: Track admin notification delivery for appointment requests
// Why: Detect failed notifications and send reminders
// How: Log all notification attempts in the database

import { createClient } from '@supabase/supabase-js';

interface NotificationLogEntry {
  appointment_id: string;
  admin_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'bounced';
  error_message?: string;
  email_service_id?: string;
}

/**
 * Log an admin notification attempt in the database
 *
 * @param entry - Notification attempt details
 * @returns True if logged successfully, false otherwise
 */
export async function logAppointmentNotification(
  entry: NotificationLogEntry
): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('appointment_notification_log')
      .insert({
        appointment_id: entry.appointment_id,
        admin_email: entry.admin_email,
        subject: entry.subject,
        status: entry.status,
        error_message: entry.error_message || null,
        email_service_id: entry.email_service_id || null,
      });

    if (error) {
      console.error('[Appointment Notifications] Failed to log notification:', error);
      return false;
    }

    console.log(`[Appointment Notifications] Logged ${entry.status} notification for appointment ${entry.appointment_id}`);
    return true;
  } catch (err) {
    console.error('[Appointment Notifications] Error logging notification:', err);
    return false;
  }
}

/**
 * Check if an appointment notification failed and send a reminder to admin
 * Use this to identify lost notifications that weren't acknowledged within 24 hours
 *
 * @returns List of appointment IDs that need reminders
 */
export async function findAppointmentsNeedingReminders(): Promise<string[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find appointments where:
    // 1. Status is pending (waiting for admin action)
    // 2. Notification was sent to admin
    // 3. No reminder has been sent yet
    // 4. More than 2 hours have passed since initial notification
    const { data, error } = await supabase
      .from('appointment_requests')
      .select('id')
      .eq('status', 'pending')
      .eq('admin_notification_status', 'sent')
      .is('admin_last_reminder_sent_at', null)
      .lt('admin_notification_sent_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('[Appointment Notifications] Error finding reminders:', error);
      return [];
    }

    return (data || []).map(r => r.id);
  } catch (err) {
    console.error('[Appointment Notifications] Error in findAppointmentsNeedingReminders:', err);
    return [];
  }
}

/**
 * Mark a reminder as sent for an appointment
 *
 * @param appointmentId - ID of appointment to mark
 * @returns True if updated successfully, false otherwise
 */
export async function markReminderSent(appointmentId: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('appointment_requests')
      .update({ admin_last_reminder_sent_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (error) {
      console.error('[Appointment Notifications] Failed to mark reminder sent:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Appointment Notifications] Error marking reminder:', err);
    return false;
  }
}

/**
 * Get appointment requests that have failed notifications
 * Use for admin dashboard to show what went wrong
 *
 * @returns List of appointments with failed notifications
 */
export async function getFailedNotifications(): Promise<Array<{
  appointment_id: string;
  customer_name: string | null;
  customer_email: string;
  preferred_date: string;
  status: string;
  last_error: string | null;
}>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('appointment_requests')
      .select(`
        id: id,
        customer_name,
        customer_email,
        preferred_date,
        admin_notification_status,
        notification_logs: appointment_notification_log (
          error_message,
          created_at
        )
      `)
      .eq('admin_notification_status', 'failed')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Appointment Notifications] Error fetching failed notifications:', error);
      return [];
    }

    return (data || []).map((apt: any) => ({
      appointment_id: apt.id,
      customer_name: apt.customer_name,
      customer_email: apt.customer_email,
      preferred_date: apt.preferred_date,
      status: apt.admin_notification_status,
      last_error: apt.notification_logs?.[0]?.error_message || null,
    }));
  } catch (err) {
    console.error('[Appointment Notifications] Error in getFailedNotifications:', err);
    return [];
  }
}

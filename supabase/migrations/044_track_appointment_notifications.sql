-- ============================================================================
-- Track Appointment Request Notifications
-- ============================================================================
-- What: Add columns to track when admin notifications are sent and confirmed
-- Why: Prevent lost appointment requests due to email delivery failures
-- How: Record when notification was sent and optionally when admin opens/confirms it

-- ============================================================================
-- Add notification tracking columns
-- ============================================================================

alter table appointment_requests
add column if not exists admin_notification_sent_at timestamp with time zone,
add column if not exists admin_notification_email text,
add column if not exists admin_notification_status text default 'pending' check (admin_notification_status in ('pending', 'sent', 'failed')),
add column if not exists admin_last_reminder_sent_at timestamp with time zone;

-- ============================================================================
-- Add indexes for efficient queries
-- ============================================================================

-- Find appointments with notifications pending/failed
create index if not exists appointment_requests_notification_status_idx
  on appointment_requests(admin_notification_status, created_at desc)
  where status = 'pending';

-- Find appointments that need reminders (notification sent but not confirmed within 24 hours)
create index if not exists appointment_requests_reminder_needed_idx
  on appointment_requests(created_at)
  where
    status = 'pending'
    and admin_notification_status = 'sent'
    and admin_last_reminder_sent_at is null;

-- ============================================================================
-- Add admin notification delivery log table
-- ============================================================================
-- Provides audit trail of all admin notification attempts

create table if not exists appointment_notification_log (
  id uuid primary key default gen_random_uuid(),

  -- Reference to appointment
  appointment_id uuid not null references appointment_requests(id) on delete cascade,

  -- Email details
  admin_email text not null,
  subject text not null,

  -- Delivery attempt info
  attempt_number integer not null default 1,
  status text not null default 'pending' check (status in ('sent', 'failed', 'bounced')),
  error_message text,

  -- Response info (if available)
  email_service_id text,
  delivery_timestamp timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- Indexes for delivery log
-- ============================================================================

create index if not exists appointment_notification_log_appointment_id_idx
  on appointment_notification_log(appointment_id);

create index if not exists appointment_notification_log_status_idx
  on appointment_notification_log(status, created_at desc);

-- ============================================================================
-- Trigger to update notification sent timestamp
-- ============================================================================
-- When a notification is successfully sent, update the parent record

create or replace function update_appointment_notification_sent()
returns trigger as $$
begin
  if new.status = 'sent' then
    update appointment_requests
    set
      admin_notification_sent_at = now(),
      admin_notification_status = 'sent'
    where id = new.appointment_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger appointment_notification_log_sent_trigger
  after insert on appointment_notification_log
  for each row
  execute function update_appointment_notification_sent();

-- ============================================================================
-- Trigger to auto-update notification log timestamp
-- ============================================================================

create trigger update_appointment_notification_log_updated_at
  before update on appointment_notification_log
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- Enable RLS
-- ============================================================================

alter table appointment_notification_log enable row level security;

-- Admins can view all notification logs
create policy "Admins can view notification logs"
  on appointment_notification_log
  for select
  using (
    coalesce(
      ((auth.jwt() -> 'user_metadata')::jsonb ->> 'is_admin')::boolean,
      false
    )
  );

-- Service role can manage logs (for API routes)
create policy "Service role can manage notification logs"
  on appointment_notification_log
  for all
  using (auth.role() = 'service_role');

-- ============================================================================
-- Comments
-- ============================================================================

comment on table appointment_notification_log is
  'Audit trail of admin notification delivery attempts for appointment requests. Helps identify lost notifications.';

comment on column appointment_requests.admin_notification_status is
  'Status of admin notification: pending (not sent), sent (delivered), failed (delivery failed)';

comment on column appointment_requests.admin_last_reminder_sent_at is
  'When the last reminder was sent to admin (for appointments not yet acknowledged)';

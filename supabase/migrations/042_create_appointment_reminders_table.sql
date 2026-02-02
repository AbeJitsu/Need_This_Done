-- ============================================================================
-- Appointment Reminders Tracking Table
-- ============================================================================
-- What: Tracks when appointment reminders have been sent to customers
-- Why: Prevent duplicate reminders and track reminder engagement
-- How: Records reminder type, timestamp, and status for each appointment

-- ============================================================================
-- Create Table
-- ============================================================================

create table if not exists appointment_reminders (
  id uuid primary key default gen_random_uuid(),

  -- Link to appointment request
  appointment_id uuid not null references appointment_requests(id) on delete cascade,

  -- Appointment details at time of reminder (denormalized for query efficiency)
  order_id uuid not null references orders(id) on delete cascade,
  customer_email text not null,
  customer_name text,

  -- Reminder type and timing
  reminder_type text not null,  -- '24h', '1h', 'custom'
  hours_before_appointment integer not null,  -- 24, 1, or custom value

  -- Appointment time details (denormalized from appointment_requests)
  appointment_date date not null,
  appointment_time time not null,

  -- Email tracking
  email_sent_at timestamp with time zone not null default now(),
  email_delivered boolean default true,
  email_bounced boolean default false,
  bounce_reason text,

  -- Engagement tracking
  email_opened boolean default false,
  email_clicked boolean default false,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table appointment_reminders enable row level security;

-- Customers can view reminders for their own appointments
create policy "Customers can view own reminders"
  on appointment_reminders
  for select
  using (
    customer_email = coalesce(
      (auth.jwt() ->> 'email'),
      ''
    )
  );

-- Admins can view all reminders
create policy "Admins can view all reminders"
  on appointment_reminders
  for select
  using (
    coalesce(
      ((auth.jwt() -> 'user_metadata')::jsonb ->> 'is_admin')::boolean,
      false
    )
  );

-- Service role can manage reminders (for API routes and cron jobs)
create policy "Service role can manage reminders"
  on appointment_reminders
  for all
  using (auth.role() = 'service_role');

-- ============================================================================
-- Indexes
-- ============================================================================

-- Find reminders by appointment
create index if not exists appointment_reminders_appointment_id_idx
  on appointment_reminders(appointment_id);

-- Find reminders by order (for checking if reminder already sent)
create index if not exists appointment_reminders_order_id_idx
  on appointment_reminders(order_id);

-- Find reminders by customer email
create index if not exists appointment_reminders_customer_email_idx
  on appointment_reminders(customer_email);

-- Find reminders by type (for analytics)
create index if not exists appointment_reminders_reminder_type_idx
  on appointment_reminders(reminder_type);

-- Find reminders sent in date range
create index if not exists appointment_reminders_email_sent_at_idx
  on appointment_reminders(email_sent_at);

-- ============================================================================
-- Triggers
-- ============================================================================

create trigger update_appointment_reminders_updated_at
  before update on appointment_reminders
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

comment on table appointment_reminders is
  'Tracks appointment reminder emails sent to customers. Used to prevent duplicates and track engagement.';

comment on column appointment_reminders.reminder_type is
  'Type of reminder: 24h (day before), 1h (one hour before), or custom time value';

comment on column appointment_reminders.hours_before_appointment is
  'Number of hours before appointment when reminder was sent (24, 1, or custom)';

comment on column appointment_reminders.email_delivered is
  'Whether the email was successfully delivered (based on Resend webhook)';

comment on column appointment_reminders.email_opened is
  'Whether customer opened the email (tracked via email pixel)';

comment on column appointment_reminders.email_clicked is
  'Whether customer clicked a link in the email';

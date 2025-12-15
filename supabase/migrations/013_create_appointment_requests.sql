-- ============================================================================
-- Appointment Requests Table
-- ============================================================================
-- What: Stores appointment booking requests from customers
-- Why: Consultation orders need scheduling before fulfillment
-- How: Customer submits preferences, admin approves/modifies, then creates calendar event

-- ============================================================================
-- Appointment Status Enum
-- ============================================================================

create type appointment_status as enum (
  'pending',      -- Customer submitted, waiting for admin review
  'approved',     -- Admin approved, calendar event created
  'modified',     -- Admin suggested different time
  'cancelled',    -- Admin or customer cancelled
  'completed'     -- Appointment happened
);

-- ============================================================================
-- Create Table
-- ============================================================================

create table if not exists appointment_requests (
  id uuid primary key default gen_random_uuid(),

  -- Link to order that requires appointment
  order_id uuid not null references orders(id) on delete cascade,

  -- Customer info (denormalized for easy access)
  customer_email text not null,
  customer_name text,

  -- Appointment details
  preferred_date date not null,
  preferred_time_start time not null,
  preferred_time_end time,
  alternate_date date,
  alternate_time_start time,
  alternate_time_end time,

  -- Duration from product metadata (in minutes)
  duration_minutes integer not null default 30,

  -- Customer notes/questions
  notes text,

  -- Status tracking
  status appointment_status default 'pending',

  -- Admin response
  admin_notes text,
  scheduled_at timestamp with time zone,

  -- Google Calendar event info (populated after approval)
  google_event_id text,
  google_event_link text,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table appointment_requests enable row level security;

-- Customers can view their own appointment requests (by email match)
create policy "Customers can view own appointments"
  on appointment_requests
  for select
  using (
    customer_email = coalesce(
      (auth.jwt() ->> 'email'),
      ''
    )
  );

-- Admins can view and manage all appointments
create policy "Admins can manage all appointments"
  on appointment_requests
  for all
  using (
    coalesce(
      ((auth.jwt() -> 'user_metadata')::jsonb ->> 'is_admin')::boolean,
      false
    )
  );

-- Service role can manage all appointments (for API routes)
create policy "Service role can manage appointments"
  on appointment_requests
  for all
  using (auth.role() = 'service_role');

-- ============================================================================
-- Indexes
-- ============================================================================

-- Find appointments by order
create index if not exists appointment_requests_order_id_idx
  on appointment_requests(order_id);

-- Find pending appointments for admin dashboard
create index if not exists appointment_requests_status_idx
  on appointment_requests(status)
  where status = 'pending';

-- Find appointments by date range
create index if not exists appointment_requests_preferred_date_idx
  on appointment_requests(preferred_date);

-- Find appointments by customer
create index if not exists appointment_requests_customer_email_idx
  on appointment_requests(customer_email);

-- ============================================================================
-- Triggers
-- ============================================================================

create trigger update_appointment_requests_updated_at
  before update on appointment_requests
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- Business Hour Validation Function
-- ============================================================================
-- What: Validates that appointment times fall within business hours
-- Why: Prevent customers from booking outside working hours
-- How: Check time against business hours (9 AM - 5 PM, Mon-Fri)

create or replace function validate_business_hours()
returns trigger as $$
begin
  -- Check preferred time is within business hours (9 AM - 5 PM)
  if new.preferred_time_start < '09:00:00'::time
     or new.preferred_time_start > '17:00:00'::time then
    raise exception 'Preferred time must be between 9 AM and 5 PM';
  end if;

  -- Check preferred date is a weekday (1 = Monday, 7 = Sunday)
  if extract(isodow from new.preferred_date) > 5 then
    raise exception 'Preferred date must be a weekday (Monday-Friday)';
  end if;

  -- Check alternate time if provided
  if new.alternate_time_start is not null then
    if new.alternate_time_start < '09:00:00'::time
       or new.alternate_time_start > '17:00:00'::time then
      raise exception 'Alternate time must be between 9 AM and 5 PM';
    end if;
  end if;

  -- Check alternate date if provided
  if new.alternate_date is not null then
    if extract(isodow from new.alternate_date) > 5 then
      raise exception 'Alternate date must be a weekday (Monday-Friday)';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger validate_appointment_business_hours
  before insert or update on appointment_requests
  for each row
  execute function validate_business_hours();

-- ============================================================================
-- Comments
-- ============================================================================

comment on table appointment_requests is
  'Stores customer appointment requests for consultation services. Admin reviews and approves, then calendar event is created.';

comment on column appointment_requests.status is
  'Workflow status: pending → approved/modified/cancelled → completed';

comment on column appointment_requests.google_event_id is
  'Google Calendar event ID, populated when admin approves the appointment';

-- ============================================================================
-- Prevent Appointment Double-Booking
-- ============================================================================
-- What: Add database-level constraint to prevent overlapping appointments
-- Why: TOCTOU race condition could allow two requests to book the same time slot
-- How: Add function to check for conflicts, enforce via trigger with serializable isolation

-- ============================================================================
-- Helper Function: Check Time Slot Conflicts
-- ============================================================================

create or replace function check_appointment_conflict()
returns trigger as $$
declare
  conflict_count integer;
  buffer_minutes integer := 30;
begin
  -- Only check if inserting a new appointment or updating time/status
  if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
    -- Skip validation if appointment is cancelled, completed, or modified by admin
    if new.status in ('cancelled', 'completed', 'modified') then
      return new;
    end if;

    -- Find conflicting appointments for the same date
    -- Conflict exists if:
    -- 1. Status is pending or approved (only active bookings conflict)
    -- 2. Time ranges overlap including buffer time (30 min gap between appointments)
    select count(*) into conflict_count
    from appointment_requests
    where
      -- Different appointment
      id != new.id
      -- Same date
      and preferred_date = new.preferred_date
      -- Active status only
      and status in ('pending', 'approved')
      -- Time overlap check (with buffer)
      and NOT (
        -- New appointment ends before existing starts (with buffer)
        new.preferred_time_end + (buffer_minutes || ' minutes')::interval <= preferred_time_start
        -- OR new appointment starts after existing ends (with buffer)
        or new.preferred_time_start >= preferred_time_end + (buffer_minutes || ' minutes')::interval
      );

    if conflict_count > 0 then
      raise exception 'APPOINTMENT_CONFLICT: Time slot unavailable for %s at %s-%s',
        new.preferred_date,
        new.preferred_time_start,
        new.preferred_time_end;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- Drop old trigger if exists
-- ============================================================================

drop trigger if exists check_appointment_conflict_trigger on appointment_requests;

-- ============================================================================
-- Create Trigger with Deferred Constraint
-- ============================================================================
-- DEFERRED means Supabase checks constraint at transaction end, not per-row
-- This allows serializable isolation to prevent TOCTOU race conditions

create trigger check_appointment_conflict_trigger
  before insert or update on appointment_requests
  for each row
  execute function check_appointment_conflict();

-- ============================================================================
-- Daily Booking Limit Constraint
-- ============================================================================
-- What: Prevents overbooking by enforcing max 5 appointments per day
-- How: Check count of active appointments (pending/approved) on that day

create or replace function check_daily_limit()
returns trigger as $$
declare
  daily_count integer;
  max_daily_bookings integer := 5;
begin
  if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
    -- Skip validation if appointment is cancelled/completed
    if new.status in ('cancelled', 'completed') then
      return new;
    end if;

    -- Count active appointments for the day
    select count(*) into daily_count
    from appointment_requests
    where
      preferred_date = new.preferred_date
      and status in ('pending', 'approved')
      -- Don't count self if updating
      and id != new.id;

    if daily_count >= max_daily_bookings then
      raise exception 'DAILY_LIMIT_EXCEEDED: Maximum % appointments per day',
        max_daily_bookings;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- Create Daily Limit Trigger
-- ============================================================================

drop trigger if exists check_daily_limit_trigger on appointment_requests;

create trigger check_daily_limit_trigger
  before insert or update on appointment_requests
  for each row
  execute function check_daily_limit();

-- ============================================================================
-- Index for Conflict Detection
-- ============================================================================
-- Composite index for fast conflict checking (date + status + time)

create index if not exists appointment_requests_date_status_time_idx
  on appointment_requests(preferred_date, status, preferred_time_start, preferred_time_end);

-- ============================================================================
-- Comments
-- ============================================================================

comment on function check_appointment_conflict() is
  'Prevents overlapping appointments on same date/time with 30-min buffer between bookings. Handles TOCTOU race conditions via database-level validation.';

comment on function check_daily_limit() is
  'Enforces maximum 5 appointments per day across all time slots to prevent overbooking.';

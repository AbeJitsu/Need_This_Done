-- ============================================================================
-- Google Calendar OAuth Tokens Table
-- ============================================================================
-- What: Stores OAuth tokens for Google Calendar integration
-- Why: Admin needs to connect their Google account to manage appointments
-- How: Store encrypted tokens with expiry tracking, one record per admin

-- ============================================================================
-- Create Table
-- ============================================================================

create table if not exists google_calendar_tokens (
  id uuid primary key default gen_random_uuid(),

  -- Owner of the calendar connection (admin user)
  user_id uuid not null references auth.users(id) on delete cascade,

  -- OAuth tokens from Google
  access_token text not null,
  refresh_token text not null,
  token_type text default 'Bearer',

  -- Token expiry tracking
  expires_at timestamp with time zone not null,

  -- Google account info (for display in admin UI)
  google_email text,
  google_calendar_id text default 'primary',

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Only one token per user
  constraint unique_user_token unique (user_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table google_calendar_tokens enable row level security;

-- Only the token owner can read their tokens
create policy "Users can read own tokens"
  on google_calendar_tokens
  for select
  using (auth.uid() = user_id);

-- Only admins can insert/update tokens (via API routes with service key)
create policy "Service role can manage tokens"
  on google_calendar_tokens
  for all
  using (auth.role() = 'service_role');

-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists google_calendar_tokens_user_id_idx
  on google_calendar_tokens(user_id);

create index if not exists google_calendar_tokens_expires_at_idx
  on google_calendar_tokens(expires_at);

-- ============================================================================
-- Triggers
-- ============================================================================

create trigger update_google_calendar_tokens_updated_at
  before update on google_calendar_tokens
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

comment on table google_calendar_tokens is
  'Stores OAuth tokens for Google Calendar integration. Admin connects their Google account to manage appointment bookings.';

comment on column google_calendar_tokens.google_calendar_id is
  'The specific calendar to use for appointments. Defaults to primary calendar.';

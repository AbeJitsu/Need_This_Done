-- ============================================================================
-- Migration: Create Webhook Events Table (Idempotency Protection)
-- ============================================================================
-- Purpose: Track processed webhook events to prevent duplicate processing
-- Why: Stripe may send the same webhook multiple times (network retries)
-- Impact: Prevents duplicate charges, order updates, subscription changes

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on event_id for fast duplicate lookup
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);

-- Create index on processed_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events(processed_at);

-- Add comment for documentation
COMMENT ON TABLE public.webhook_events IS 'Tracks processed webhook events to prevent duplicate processing via idempotency keys';
COMMENT ON COLUMN public.webhook_events.event_id IS 'Unique event ID from webhook provider (e.g., Stripe event ID)';
COMMENT ON COLUMN public.webhook_events.event_type IS 'Type of webhook event (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN public.webhook_events.processed_at IS 'When this event was successfully processed';

-- ============================================================================
-- Automatic Cleanup Function
-- ============================================================================
-- Delete events older than 90 days to prevent unbounded table growth
-- Keeps the table size manageable while maintaining a reasonable audit trail

CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.webhook_events
  WHERE processed_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies needed - this table is only accessed by server-side code
-- using the service role key (bypasses RLS)

-- ============================================================================
-- Grant Permissions
-- ============================================================================
GRANT SELECT, INSERT, DELETE ON public.webhook_events TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.webhook_events TO service_role;

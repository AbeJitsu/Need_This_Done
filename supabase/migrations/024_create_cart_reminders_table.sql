-- ============================================================================
-- Cart Reminders Table
-- ============================================================================
-- Tracks abandoned cart recovery emails to prevent duplicate sends
-- Works with Medusa's cart system via cart_id reference
--
-- Why: Abandoned cart emails are one of the highest-ROI marketing tactics
-- How: Cron job checks for abandoned carts, sends email, records here

-- ============================================================================
-- Create Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cart identification
  cart_id TEXT NOT NULL,                              -- Medusa cart ID
  email TEXT NOT NULL,                                -- Customer email for this cart

  -- Cart value for analytics
  cart_total INTEGER DEFAULT 0,                       -- Cart value in cents
  item_count INTEGER DEFAULT 0,                       -- Number of items

  -- Reminder tracking
  reminder_count INTEGER DEFAULT 1,                   -- Which reminder (1st, 2nd, 3rd)
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),    -- When reminder was sent
  opened_at TIMESTAMP WITH TIME ZONE,                -- Email open tracking (optional)
  clicked_at TIMESTAMP WITH TIME ZONE,               -- Link click tracking (optional)

  -- Outcome tracking
  recovered BOOLEAN DEFAULT false,                    -- Did they complete purchase?
  recovered_at TIMESTAMP WITH TIME ZONE,             -- When purchase was made

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Find reminders by cart
CREATE INDEX IF NOT EXISTS idx_cart_reminders_cart_id ON cart_reminders(cart_id);

-- Find reminders by email (for customer history)
CREATE INDEX IF NOT EXISTS idx_cart_reminders_email ON cart_reminders(email);

-- Find recent reminders (for deduplication)
CREATE INDEX IF NOT EXISTS idx_cart_reminders_sent_at ON cart_reminders(sent_at DESC);

-- Find unrecovered carts for analytics
CREATE INDEX IF NOT EXISTS idx_cart_reminders_recovered ON cart_reminders(recovered) WHERE recovered = false;

-- ============================================================================
-- RLS Policies
-- ============================================================================
-- Only server-side access needed (no user-facing queries)

ALTER TABLE cart_reminders ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for API routes and cron jobs)
CREATE POLICY "Service role has full access to cart reminders"
  ON cart_reminders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- View: Cart Recovery Analytics
-- ============================================================================
-- Quick stats for the admin dashboard

CREATE OR REPLACE VIEW cart_reminder_stats AS
SELECT
  COUNT(*) AS total_reminders,
  COUNT(DISTINCT cart_id) AS unique_carts,
  COUNT(*) FILTER (WHERE recovered = true) AS recovered_count,
  SUM(cart_total) FILTER (WHERE recovered = true) AS recovered_revenue,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE recovered = true) / NULLIF(COUNT(*), 0),
    1
  ) AS recovery_rate_percent,
  DATE_TRUNC('day', sent_at) AS date
FROM cart_reminders
GROUP BY DATE_TRUNC('day', sent_at)
ORDER BY date DESC;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE cart_reminders IS 'Tracks abandoned cart recovery emails to prevent duplicate sends';
COMMENT ON COLUMN cart_reminders.cart_id IS 'Medusa cart ID for the abandoned cart';
COMMENT ON COLUMN cart_reminders.reminder_count IS 'Which reminder in the sequence (1st, 2nd, 3rd)';
COMMENT ON COLUMN cart_reminders.recovered IS 'Whether this cart was eventually purchased';

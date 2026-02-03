-- ============================================================================
-- MIGRATION 053: Payment Attempt History Table
-- ============================================================================
-- What: Track all payment attempts for debugging and audit trail
-- Why: Admin needs visibility into why final payments fail
-- How: Log each attempt with timestamp, outcome, and error details

-- ============================================================================
-- Create Payment Attempts Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_attempts (
  -- Primary key and foreign key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Attempt metadata
  attempt_number INTEGER DEFAULT 1,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash', 'check', 'other')),
  stripe_payment_method_id TEXT,

  -- Amount details
  amount_cents INTEGER NOT NULL,

  -- Attempt status
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'succeeded', 'failed')),

  -- Failure details (only populated if status = 'failed')
  decline_code TEXT,                          -- e.g., 'insufficient_funds', 'card_declined'
  error_message TEXT,

  -- Stripe intent ID for successful attempts
  payment_intent_id TEXT,

  -- Admin tracking
  collected_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Idempotency for deduplication
  idempotency_key TEXT UNIQUE,

  -- Timestamps
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  succeeded_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Create Indexes for Fast Lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS payment_attempts_order_id_idx ON payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS payment_attempts_status_idx ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS payment_attempts_payment_method_idx ON payment_attempts(payment_method);
CREATE INDEX IF NOT EXISTS payment_attempts_created_at_idx ON payment_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS payment_attempts_idempotency_key_idx ON payment_attempts(idempotency_key);

-- ============================================================================
-- Create Function to Update Timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_payment_attempts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Trigger to Auto-Update Timestamp
-- ============================================================================

DROP TRIGGER IF EXISTS update_payment_attempts_timestamp_trigger ON payment_attempts;
CREATE TRIGGER update_payment_attempts_timestamp_trigger
BEFORE UPDATE ON payment_attempts
FOR EACH ROW
EXECUTE FUNCTION update_payment_attempts_timestamp();

-- ============================================================================
-- Enable RLS for Security
-- ============================================================================

ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all payment attempts
CREATE POLICY "Admins can view all payment attempts" ON payment_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: System can insert payment attempts (used by API handlers)
CREATE POLICY "API can insert payment attempts" ON payment_attempts
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE payment_attempts IS 'Audit trail of all payment collection attempts for each order';
COMMENT ON COLUMN payment_attempts.order_id IS 'Order being charged';
COMMENT ON COLUMN payment_attempts.attempt_number IS 'Sequence number (1st, 2nd, 3rd attempt, etc)';
COMMENT ON COLUMN payment_attempts.payment_method IS 'How payment was attempted: card, cash, check, other';
COMMENT ON COLUMN payment_attempts.stripe_payment_method_id IS 'Stripe PaymentMethod ID for card charges';
COMMENT ON COLUMN payment_attempts.amount_cents IS 'Amount attempted to charge, in cents';
COMMENT ON COLUMN payment_attempts.status IS 'Outcome: processing, succeeded, or failed';
COMMENT ON COLUMN payment_attempts.decline_code IS 'Stripe decline code if failed (e.g., insufficient_funds)';
COMMENT ON COLUMN payment_attempts.error_message IS 'Human-readable error message';
COMMENT ON COLUMN payment_attempts.payment_intent_id IS 'Stripe PaymentIntent ID from this attempt';
COMMENT ON COLUMN payment_attempts.collected_by_admin_id IS 'Admin who manually collected alternative payment';
COMMENT ON COLUMN payment_attempts.idempotency_key IS 'Prevents duplicate processing of same request';
COMMENT ON COLUMN payment_attempts.attempted_at IS 'When payment attempt was initiated';
COMMENT ON COLUMN payment_attempts.succeeded_at IS 'When payment succeeded (populated if status=succeeded)';
COMMENT ON COLUMN payment_attempts.failed_at IS 'When payment failed (populated if status=failed)';

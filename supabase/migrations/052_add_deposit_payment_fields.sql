-- ============================================================================
-- MIGRATION 052: Add Deposit Payment Fields to Orders
-- ============================================================================
-- What: Add columns to support 50/50 deposit + final payment split
-- Why: Enable two-phase payment system (deposit at checkout, final on delivery)
-- How: Add deposit tracking, payment method storage, and status fields

-- ============================================================================
-- Add Deposit Payment Columns to Orders Table
-- ============================================================================

ALTER TABLE orders
  -- Deposit payment tracking
  ADD COLUMN IF NOT EXISTS deposit_amount INTEGER,               -- Deposit paid (50% of total)
  ADD COLUMN IF NOT EXISTS balance_remaining INTEGER,             -- Amount still owed

  -- Stripe Payment Intent IDs
  ADD COLUMN IF NOT EXISTS deposit_payment_intent_id TEXT,        -- PI for deposit
  ADD COLUMN IF NOT EXISTS final_payment_intent_id TEXT,          -- PI for final charge

  -- Final payment tracking
  ADD COLUMN IF NOT EXISTS final_payment_status TEXT DEFAULT 'pending',  -- pending, paid, failed, waived
  ADD COLUMN IF NOT EXISTS final_payment_method TEXT,             -- card, cash, check, other
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,         -- Saved card for future charge

  -- Status timestamps
  ADD COLUMN IF NOT EXISTS ready_for_delivery_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS final_payment_completed_at TIMESTAMP WITH TIME ZONE,

  -- Payment status override (differentiates deposit_paid from paid)
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';  -- pending, deposit_paid, paid

-- ============================================================================
-- Create Indexes for Admin Dashboard and Queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS orders_final_payment_status_idx ON orders(final_payment_status)
  WHERE final_payment_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);

CREATE INDEX IF NOT EXISTS orders_stripe_payment_method_id_idx ON orders(stripe_payment_method_id)
  WHERE stripe_payment_method_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_ready_for_delivery_at_idx ON orders(ready_for_delivery_at DESC NULLS LAST);

-- ============================================================================
-- Add Cancellation Fields
-- ============================================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================================================
-- Add Constraints for Data Integrity
-- ============================================================================

-- Validate final_payment_status values
ALTER TABLE orders
  ADD CONSTRAINT orders_final_payment_status_check
    CHECK (final_payment_status IN ('pending', 'paid', 'failed', 'waived'))
    NOT VALID;

-- Validate final_payment_method values
ALTER TABLE orders
  ADD CONSTRAINT orders_final_payment_method_check
    CHECK (final_payment_method IN ('card', 'cash', 'check', 'other'))
    NOT VALID;

-- Validate payment_status values
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending', 'deposit_paid', 'paid', 'canceled', 'failed'))
    NOT VALID;

-- Logical constraint: if deposit_amount set, balance_remaining must also be set
ALTER TABLE orders
  ADD CONSTRAINT orders_deposit_balance_together
    CHECK ((deposit_amount IS NULL AND balance_remaining IS NULL) OR (deposit_amount IS NOT NULL AND balance_remaining IS NOT NULL))
    NOT VALID;

-- ============================================================================
-- Create Function to Calculate Deposit from Total
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_deposit_amount(total_cents INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Return 50% rounded up (ceiling division)
  RETURN CEILING(total_cents::NUMERIC / 2)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Create Function to Check If Order Has Pending Final Payment
-- ============================================================================

CREATE OR REPLACE FUNCTION has_pending_final_payment(order_id UUID)
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM orders
  WHERE id = order_id
    AND final_payment_status = 'pending'
    AND balance_remaining > 0
    AND deposit_amount > 0
);
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN orders.deposit_amount IS 'Amount of 50% deposit paid (in cents)';
COMMENT ON COLUMN orders.balance_remaining IS 'Remaining balance due on final payment (in cents)';
COMMENT ON COLUMN orders.deposit_payment_intent_id IS 'Stripe PaymentIntent ID for deposit charge';
COMMENT ON COLUMN orders.final_payment_intent_id IS 'Stripe PaymentIntent ID for final charge';
COMMENT ON COLUMN orders.final_payment_status IS 'Status of final payment: pending, paid, failed, or waived';
COMMENT ON COLUMN orders.final_payment_method IS 'How final payment was collected: card, cash, check, or other';
COMMENT ON COLUMN orders.stripe_payment_method_id IS 'Saved Stripe PaymentMethod ID for charging on delivery';
COMMENT ON COLUMN orders.ready_for_delivery_at IS 'Timestamp when admin marked order ready for delivery';
COMMENT ON COLUMN orders.final_payment_completed_at IS 'Timestamp when final payment was completed';
COMMENT ON COLUMN orders.payment_status IS 'Payment phase: pending, deposit_paid, paid, canceled, failed';
COMMENT ON COLUMN orders.canceled_at IS 'Timestamp when order was canceled by admin';
COMMENT ON COLUMN orders.cancel_reason IS 'Reason for cancellation provided by admin';
COMMENT ON COLUMN orders.admin_notes IS 'Additional notes from admin about cancellation';


COMMENT ON FUNCTION calculate_deposit_amount IS 'Calculates 50% deposit amount from total, rounded up';
COMMENT ON FUNCTION has_pending_final_payment IS 'Returns true if order has pending final payment to collect';

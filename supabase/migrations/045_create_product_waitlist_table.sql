-- ============================================================================
-- Create Product Waitlist Table
-- ============================================================================
-- What: Tracks customers interested in out-of-stock products
-- Why: Capture demand for unavailable items and enable notifications
-- When: When product stock returns, notify waitlisted customers

CREATE TABLE IF NOT EXISTS product_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  variant_id UUID,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prevent duplicate waitlist entries for same product/email
CREATE UNIQUE INDEX idx_product_waitlist_email_product
ON product_waitlist(email, product_id)
WHERE status = 'pending';

-- Index for finding pending waitlist entries to notify
CREATE INDEX idx_product_waitlist_pending
ON product_waitlist(product_id, status);

-- Index for finding user's waitlist entries
CREATE INDEX idx_product_waitlist_email
ON product_waitlist(email, status);

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_product_waitlist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_waitlist_timestamp ON product_waitlist;
CREATE TRIGGER trigger_product_waitlist_timestamp
BEFORE UPDATE ON product_waitlist
FOR EACH ROW
EXECUTE FUNCTION update_product_waitlist_timestamp();

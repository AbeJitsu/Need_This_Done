-- ============================================================================
-- Create Quotes Table
-- ============================================================================
-- What: Stores project quotes with deposit/balance tracking
-- Why: Enables quote-to-deposit-to-project workflow
-- How: Links to projects, tracks payment status, expires after 30 days

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quote identification
  reference_number TEXT UNIQUE NOT NULL, -- Format: NTD-MMDDYY-HHMM

  -- Link to project inquiry
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Customer info (denormalized for easy access)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  -- Amounts (in cents)
  total_amount INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL, -- Always 50% of total

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft',
  -- Possible values: 'draft', 'sent', 'authorized', 'deposit_paid', 'balance_paid', 'completed', 'expired', 'cancelled'

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Additional info
  notes TEXT,
  line_items JSONB DEFAULT '[]'::jsonb, -- Array of {description, amount} objects

  -- Stripe integration
  stripe_payment_intent_id TEXT, -- For deposit payment
  stripe_balance_payment_intent_id TEXT, -- For balance payment

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all quotes"
  ON quotes
  FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
  );

-- Customers can view their own quotes by email (for quote lookup)
CREATE POLICY "Customers can view own quotes by email"
  ON quotes
  FOR SELECT
  USING (
    customer_email = COALESCE(
      (auth.jwt() ->> 'email'),
      current_setting('request.headers', true)::json ->> 'x-customer-email'
    )
  );

-- ============================================================================
-- Indexes
-- ============================================================================

-- Fast lookup by reference number (primary lookup method)
CREATE INDEX IF NOT EXISTS quotes_reference_number_idx ON quotes(reference_number);

-- Lookup by customer email
CREATE INDEX IF NOT EXISTS quotes_customer_email_idx ON quotes(customer_email);

-- Find quotes by status
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);

-- Find expired quotes (for cleanup/notification cron)
CREATE INDEX IF NOT EXISTS quotes_expires_at_idx ON quotes(expires_at)
  WHERE status IN ('draft', 'sent', 'authorized');

-- Link to project
CREATE INDEX IF NOT EXISTS quotes_project_id_idx ON quotes(project_id);

-- Recent quotes first
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes(created_at DESC);

-- ============================================================================
-- Updated At Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();

-- ============================================================================
-- Helper Function: Generate Quote Reference
-- ============================================================================
-- Format: NTD-MMDDYY-HHMM (e.g., NTD-010125-1430)

CREATE OR REPLACE FUNCTION generate_quote_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate reference: NTD-MMDDYY-HHMM
    ref := 'NTD-' || TO_CHAR(now(), 'MMDDYY-HH24MI');

    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM quotes WHERE reference_number = ref) INTO exists_check;

    -- If unique, return it
    IF NOT exists_check THEN
      RETURN ref;
    END IF;

    -- If collision (same minute), add random suffix and retry
    ref := ref || '-' || SUBSTR(MD5(random()::text), 1, 4);

    SELECT EXISTS(SELECT 1 FROM quotes WHERE reference_number = ref) INTO exists_check;
    IF NOT exists_check THEN
      RETURN ref;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE quotes IS 'Project quotes with deposit/balance payment tracking';
COMMENT ON COLUMN quotes.reference_number IS 'Unique quote reference in format NTD-MMDDYY-HHMM';
COMMENT ON COLUMN quotes.project_id IS 'Optional link to project inquiry that generated this quote';
COMMENT ON COLUMN quotes.total_amount IS 'Total project cost in cents';
COMMENT ON COLUMN quotes.deposit_amount IS 'Deposit amount in cents (always 50% of total)';
COMMENT ON COLUMN quotes.status IS 'Quote lifecycle: draft → sent → authorized → deposit_paid → balance_paid → completed';
COMMENT ON COLUMN quotes.expires_at IS 'Quote expires 30 days after creation';
COMMENT ON COLUMN quotes.line_items IS 'Breakdown of quote items [{description, amount}]';
COMMENT ON FUNCTION generate_quote_reference() IS 'Generates unique quote reference number';

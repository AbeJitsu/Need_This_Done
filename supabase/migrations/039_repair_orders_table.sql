-- ============================================================================
-- Repair Orders Table
-- ============================================================================
-- What: Recreates the orders table if it was dropped/missing
-- Why: Migration 006 shows as applied but table doesn't exist in remote
-- How: Defensively creates table, RLS, indexes, and adds quote_id column

-- ============================================================================
-- Create Orders Table (if missing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to Supabase user
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link to Medusa order
  medusa_order_id TEXT NOT NULL UNIQUE,

  -- Order data snapshot (for quick access without calling Medusa)
  total INTEGER, -- Amount in cents
  status TEXT, -- 'pending', 'completed', 'canceled'
  email TEXT, -- Customer email from order

  -- Link to quote (for deposit payments)
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders (via API)
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
      false
    )
  );

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_medusa_order_id_idx ON orders(medusa_order_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_quote_id_idx ON orders(quote_id);

-- ============================================================================
-- Auto-update updated_at Timestamp
-- ============================================================================

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE orders IS 'Maps Medusa ecommerce orders to Supabase users';
COMMENT ON COLUMN orders.quote_id IS 'Optional link to quote that generated this order (for deposit payments)';

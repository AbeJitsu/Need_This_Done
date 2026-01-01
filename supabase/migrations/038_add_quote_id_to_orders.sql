-- ============================================================================
-- Add Quote ID to Orders Table
-- ============================================================================
-- What: Links orders to quotes for deposit/balance tracking
-- Why: When a customer pays a deposit, we create an order linked to their quote
-- How: Adds nullable quote_id column with foreign key to quotes table

-- Add quote_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;

-- ============================================================================
-- Index for Performance
-- ============================================================================

-- Look up orders by quote
CREATE INDEX IF NOT EXISTS orders_quote_id_idx ON orders(quote_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN orders.quote_id IS 'Optional link to quote that generated this order (for deposit payments)';

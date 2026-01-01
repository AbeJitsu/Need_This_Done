-- ============================================================================
-- Add Quote ID to Orders Table
-- ============================================================================
-- What: Links orders to quotes for deposit/balance tracking
-- Why: When a customer pays a deposit, we create an order linked to their quote
-- How: Adds nullable quote_id column with foreign key to quotes table
-- Note: Defensive migration - only runs if orders table exists

DO $$
BEGIN
  -- Only proceed if the orders table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    -- Add quote_id column if it doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'quote_id') THEN
      ALTER TABLE orders ADD COLUMN quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;
    END IF;

    -- Create index if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'orders' AND indexname = 'orders_quote_id_idx') THEN
      CREATE INDEX orders_quote_id_idx ON orders(quote_id);
    END IF;

    -- Add comment
    COMMENT ON COLUMN orders.quote_id IS 'Optional link to quote that generated this order (for deposit payments)';

    RAISE NOTICE 'Successfully added quote_id column to orders table';
  ELSE
    RAISE NOTICE 'Orders table does not exist - skipping quote_id column. Create orders table first.';
  END IF;
END
$$;

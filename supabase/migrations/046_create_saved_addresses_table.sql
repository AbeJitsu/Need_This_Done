-- ============================================================================
-- Create Saved Addresses Table
-- ============================================================================
-- What: Allows customers to save multiple shipping/billing addresses
-- Why: Speeds up checkout process and improves UX for repeat customers
-- When: Customers can save, edit, delete addresses from account settings

CREATE TABLE IF NOT EXISTS saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  label TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing', 'both')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure each user can have only one default address per type
CREATE UNIQUE INDEX idx_saved_addresses_default_shipping
ON saved_addresses(user_email)
WHERE is_default = true AND address_type IN ('shipping', 'both');

-- Index for quick lookup by user email
CREATE INDEX idx_saved_addresses_email
ON saved_addresses(user_email);

-- Index for finding default address
CREATE INDEX idx_saved_addresses_email_default
ON saved_addresses(user_email, is_default);

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_saved_addresses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_saved_addresses_timestamp ON saved_addresses;
CREATE TRIGGER trigger_saved_addresses_timestamp
BEFORE UPDATE ON saved_addresses
FOR EACH ROW
EXECUTE FUNCTION update_saved_addresses_timestamp();

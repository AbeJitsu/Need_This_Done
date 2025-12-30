-- ============================================================================
-- Migration: Create Currencies Tables
-- ============================================================================
-- What: Currency settings and exchange rates for multi-currency support
-- Why: Enable international customers to shop in their preferred currency
-- How: Store rates, track preferences, format prices per locale

-- ============================================================================
-- Currencies Table
-- ============================================================================
-- Stores supported currencies with their formatting rules

CREATE TABLE IF NOT EXISTS currencies (
  code VARCHAR(3) PRIMARY KEY,               -- ISO 4217 code (USD, EUR, GBP)
  name VARCHAR(100) NOT NULL,                -- Display name (US Dollar)
  symbol VARCHAR(10) NOT NULL,               -- Currency symbol ($, €, £)
  symbol_position VARCHAR(10) DEFAULT 'before', -- 'before' or 'after'
  decimal_places INTEGER DEFAULT 2,          -- Number of decimal places
  thousand_separator VARCHAR(5) DEFAULT ',', -- Thousand separator
  decimal_separator VARCHAR(5) DEFAULT '.',  -- Decimal separator
  is_active BOOLEAN DEFAULT true,            -- Whether currency is available
  is_default BOOLEAN DEFAULT false,          -- Default currency for store
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Exchange Rates Table
-- ============================================================================
-- Stores exchange rates from base currency (USD) to other currencies

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
  to_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
  rate DECIMAL(20, 10) NOT NULL,             -- Exchange rate (high precision)
  source VARCHAR(50) DEFAULT 'manual',       -- Rate source (api, manual)
  fetched_at TIMESTAMPTZ DEFAULT NOW(),      -- When rate was fetched
  expires_at TIMESTAMPTZ,                    -- When rate expires (for caching)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_currency_pair UNIQUE (from_currency, to_currency)
);

-- ============================================================================
-- User Currency Preferences Table
-- ============================================================================
-- Stores user's preferred currency (persistent across sessions)

CREATE TABLE IF NOT EXISTS user_currency_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),                   -- For anonymous users
  currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code),
  detected_from VARCHAR(50),                 -- How we detected preference (geo, browser, selection)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either user_id or session_id must be set
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL),
  -- Unique per user or session
  CONSTRAINT unique_user_preference UNIQUE (user_id),
  CONSTRAINT unique_session_preference UNIQUE (session_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_currency_preferences ENABLE ROW LEVEL SECURITY;

-- Currencies: Anyone can read active currencies, only admins can modify
CREATE POLICY "Anyone can read active currencies"
  ON currencies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage currencies"
  ON currencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Exchange rates: Anyone can read, only admins can modify
CREATE POLICY "Anyone can read exchange rates"
  ON exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON exchange_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- User preferences: Users can read/write their own, sessions can read/write by session_id
CREATE POLICY "Users can manage their currency preference"
  ON user_currency_preferences FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anonymous users can manage session preferences"
  ON user_currency_preferences FOR ALL
  USING (session_id IS NOT NULL AND user_id IS NULL);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_exchange_rates_from ON exchange_rates(from_currency);
CREATE INDEX idx_exchange_rates_to ON exchange_rates(to_currency);
CREATE INDEX idx_exchange_rates_expires ON exchange_rates(expires_at);
CREATE INDEX idx_user_currency_session ON user_currency_preferences(session_id);

-- ============================================================================
-- Functions
-- ============================================================================

-- Convert amount from one currency to another
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount DECIMAL,
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3)
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate DECIMAL;
  v_converted DECIMAL;
BEGIN
  -- Same currency, no conversion needed
  IF p_from_currency = p_to_currency THEN
    RETURN p_amount;
  END IF;

  -- Get exchange rate
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND (expires_at IS NULL OR expires_at > NOW());

  -- If no direct rate, try reverse
  IF v_rate IS NULL THEN
    SELECT 1.0 / rate INTO v_rate
    FROM exchange_rates
    WHERE from_currency = p_to_currency
      AND to_currency = p_from_currency
      AND (expires_at IS NULL OR expires_at > NOW());
  END IF;

  -- If still no rate, return NULL
  IF v_rate IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate conversion
  v_converted := p_amount * v_rate;

  RETURN v_converted;
END;
$$;

-- Format price in a specific currency
CREATE OR REPLACE FUNCTION format_price(
  p_amount DECIMAL,
  p_currency_code VARCHAR(3)
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_currency currencies%ROWTYPE;
  v_formatted TEXT;
  v_integer_part TEXT;
  v_decimal_part TEXT;
  v_temp TEXT;
  v_i INTEGER;
BEGIN
  -- Get currency settings
  SELECT * INTO v_currency
  FROM currencies
  WHERE code = p_currency_code;

  IF v_currency IS NULL THEN
    RETURN p_amount::TEXT;
  END IF;

  -- Round to correct decimal places
  p_amount := ROUND(p_amount, v_currency.decimal_places);

  -- Split into integer and decimal parts
  v_integer_part := FLOOR(ABS(p_amount))::TEXT;
  v_decimal_part := SUBSTRING(ABS(p_amount)::TEXT FROM POSITION('.' IN ABS(p_amount)::TEXT) + 1);

  -- Pad decimal part if needed
  WHILE LENGTH(COALESCE(v_decimal_part, '')) < v_currency.decimal_places LOOP
    v_decimal_part := COALESCE(v_decimal_part, '') || '0';
  END LOOP;

  -- Add thousand separators
  v_temp := '';
  FOR v_i IN REVERSE LENGTH(v_integer_part)..1 LOOP
    IF v_temp != '' AND (LENGTH(v_integer_part) - v_i + 1) % 3 = 1 THEN
      v_temp := v_currency.thousand_separator || v_temp;
    END IF;
    v_temp := SUBSTRING(v_integer_part FROM v_i FOR 1) || v_temp;
  END LOOP;
  v_integer_part := v_temp;

  -- Combine parts
  IF v_currency.decimal_places > 0 THEN
    v_formatted := v_integer_part || v_currency.decimal_separator || v_decimal_part;
  ELSE
    v_formatted := v_integer_part;
  END IF;

  -- Add negative sign if needed
  IF p_amount < 0 THEN
    v_formatted := '-' || v_formatted;
  END IF;

  -- Add currency symbol
  IF v_currency.symbol_position = 'before' THEN
    v_formatted := v_currency.symbol || v_formatted;
  ELSE
    v_formatted := v_formatted || ' ' || v_currency.symbol;
  END IF;

  RETURN v_formatted;
END;
$$;

-- ============================================================================
-- Seed Data: Common Currencies
-- ============================================================================

INSERT INTO currencies (code, name, symbol, symbol_position, decimal_places, thousand_separator, decimal_separator, is_active, is_default)
VALUES
  ('USD', 'US Dollar', '$', 'before', 2, ',', '.', true, true),
  ('EUR', 'Euro', '€', 'after', 2, '.', ',', true, false),
  ('GBP', 'British Pound', '£', 'before', 2, ',', '.', true, false),
  ('CAD', 'Canadian Dollar', 'CA$', 'before', 2, ',', '.', true, false),
  ('AUD', 'Australian Dollar', 'A$', 'before', 2, ',', '.', true, false),
  ('JPY', 'Japanese Yen', '¥', 'before', 0, ',', '.', true, false),
  ('CNY', 'Chinese Yuan', '¥', 'before', 2, ',', '.', true, false),
  ('INR', 'Indian Rupee', '₹', 'before', 2, ',', '.', true, false),
  ('MXN', 'Mexican Peso', 'MX$', 'before', 2, ',', '.', true, false),
  ('BRL', 'Brazilian Real', 'R$', 'before', 2, '.', ',', true, false)
ON CONFLICT (code) DO NOTHING;

-- Seed exchange rates (approximate, should be updated via API)
INSERT INTO exchange_rates (from_currency, to_currency, rate, source, expires_at)
VALUES
  ('USD', 'EUR', 0.92, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'GBP', 0.79, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'CAD', 1.36, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'AUD', 1.53, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'JPY', 149.50, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'CNY', 7.24, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'INR', 83.12, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'MXN', 17.15, 'manual', NOW() + INTERVAL '24 hours'),
  ('USD', 'BRL', 4.97, 'manual', NOW() + INTERVAL '24 hours')
ON CONFLICT (from_currency, to_currency) DO UPDATE
SET rate = EXCLUDED.rate,
    source = EXCLUDED.source,
    expires_at = EXCLUDED.expires_at,
    fetched_at = NOW();

-- ============================================================================
-- Trigger: Update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_currency_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER currencies_updated_at
  BEFORE UPDATE ON currencies
  FOR EACH ROW
  EXECUTE FUNCTION update_currency_timestamp();

CREATE TRIGGER user_currency_preferences_updated_at
  BEFORE UPDATE ON user_currency_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_currency_timestamp();

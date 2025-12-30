-- ============================================================================
-- Coupons Table
-- ============================================================================
-- Manages discount codes and promotional offers
-- Supports: percentage, fixed amount, free shipping, buy X get Y
--
-- Why: Coupons drive sales during promotions and recover hesitant customers
-- How: Store codes with rules, validate at checkout, track usage

-- ============================================================================
-- Create Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coupon identity
  code TEXT NOT NULL UNIQUE,                          -- The code customers enter
  name TEXT NOT NULL,                                  -- Internal name for reference
  description TEXT,                                    -- Customer-facing description

  -- Discount type and value
  discount_type TEXT NOT NULL CHECK (
    discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')
  ),
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,    -- Percentage or fixed amount

  -- Buy X Get Y specifics (nullable)
  buy_quantity INTEGER,                               -- Buy this many
  get_quantity INTEGER,                               -- Get this many free/discounted
  get_discount_percent DECIMAL(5,2),                  -- Discount on the "get" items

  -- Minimum requirements
  minimum_order_amount INTEGER DEFAULT 0,             -- Minimum cart value in cents
  minimum_quantity INTEGER DEFAULT 0,                 -- Minimum items in cart

  -- Usage limits
  max_uses INTEGER,                                   -- Total uses allowed (null = unlimited)
  max_uses_per_customer INTEGER DEFAULT 1,           -- Uses per customer
  current_uses INTEGER DEFAULT 0,                     -- Track usage count

  -- Product restrictions (null = applies to all)
  applicable_product_ids TEXT[],                      -- Specific products only
  applicable_category_ids TEXT[],                     -- Specific categories only
  excluded_product_ids TEXT[],                        -- Excluded products

  -- Customer restrictions
  customer_email_pattern TEXT,                        -- Regex pattern for emails
  first_order_only BOOLEAN DEFAULT false,            -- Only for first-time customers
  customer_ids UUID[],                                -- Specific customer list

  -- Validity period
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Track coupon usage for analytics and limit enforcement
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT,                                      -- Medusa order ID if applicable

  -- Usage details
  discount_applied INTEGER NOT NULL DEFAULT 0,        -- Actual discount in cents
  order_total INTEGER,                                -- Order total before discount
  email TEXT,                                         -- Customer email (for anon)

  -- Timestamp
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Fast code lookups (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_upper ON coupons(UPPER(code));

-- Active coupons query
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- Validity period queries
CREATE INDEX IF NOT EXISTS idx_coupons_validity ON coupons(starts_at, expires_at);

-- Usage tracking
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access to coupons"
  ON coupons FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to coupon_usage"
  ON coupon_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public can validate active coupons
CREATE POLICY "Public can read active coupons"
  ON coupons FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Users can see their own usage
CREATE POLICY "Users can read own coupon usage"
  ON coupon_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- Function: Validate Coupon
-- ============================================================================
-- Checks if a coupon is valid for a given context

CREATE OR REPLACE FUNCTION validate_coupon(
  p_code TEXT,
  p_cart_total INTEGER DEFAULT 0,
  p_item_count INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_is_first_order BOOLEAN DEFAULT false
) RETURNS TABLE (
  is_valid BOOLEAN,
  coupon_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  discount_amount INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_discount_amount INTEGER;
BEGIN
  -- Find the coupon (case-insensitive)
  SELECT * INTO v_coupon
  FROM coupons c
  WHERE UPPER(c.code) = UPPER(p_code)
  AND c.is_active = true
  AND c.starts_at <= now()
  AND (c.expires_at IS NULL OR c.expires_at > now());

  -- Coupon not found or inactive
  IF v_coupon IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 0, 'Invalid or expired coupon code';
    RETURN;
  END IF;

  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'Coupon usage limit reached';
    RETURN;
  END IF;

  -- Check user-specific usage limit
  IF p_user_id IS NOT NULL AND v_coupon.max_uses_per_customer IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

    IF v_user_usage_count >= v_coupon.max_uses_per_customer THEN
      RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'You have already used this coupon';
      RETURN;
    END IF;
  END IF;

  -- Check minimum order amount
  IF v_coupon.minimum_order_amount > 0 AND p_cart_total < v_coupon.minimum_order_amount THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0,
      'Minimum order of $' || (v_coupon.minimum_order_amount / 100.0)::TEXT || ' required';
    RETURN;
  END IF;

  -- Check minimum quantity
  IF v_coupon.minimum_quantity > 0 AND p_item_count < v_coupon.minimum_quantity THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0,
      'Minimum ' || v_coupon.minimum_quantity || ' items required';
    RETURN;
  END IF;

  -- Check first order only
  IF v_coupon.first_order_only AND NOT p_is_first_order THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'This coupon is for first orders only';
    RETURN;
  END IF;

  -- Calculate discount amount
  CASE v_coupon.discount_type
    WHEN 'percentage' THEN
      v_discount_amount := FLOOR(p_cart_total * (v_coupon.discount_value / 100));
    WHEN 'fixed_amount' THEN
      v_discount_amount := LEAST(v_coupon.discount_value * 100, p_cart_total)::INTEGER;
    WHEN 'free_shipping' THEN
      v_discount_amount := 0; -- Handled separately at checkout
    ELSE
      v_discount_amount := 0;
  END CASE;

  -- Return valid result
  RETURN QUERY SELECT true, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, v_discount_amount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Apply Coupon
-- ============================================================================
-- Records coupon usage and increments counter

CREATE OR REPLACE FUNCTION apply_coupon(
  p_coupon_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_order_id TEXT DEFAULT NULL,
  p_discount_applied INTEGER DEFAULT 0,
  p_order_total INTEGER DEFAULT 0,
  p_email TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Record usage
  INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_applied, order_total, email)
  VALUES (p_coupon_id, p_user_id, p_order_id, p_discount_applied, p_order_total, p_email);

  -- Increment usage counter
  UPDATE coupons
  SET current_uses = current_uses + 1, updated_at = now()
  WHERE id = p_coupon_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Trigger: Update Timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_coupon_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coupon_timestamp
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_timestamp();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE coupons IS 'Discount codes and promotional offers';
COMMENT ON TABLE coupon_usage IS 'Tracks coupon usage for analytics and limit enforcement';
COMMENT ON FUNCTION validate_coupon IS 'Validates a coupon code against cart context';
COMMENT ON FUNCTION apply_coupon IS 'Records coupon usage after successful order';

-- ============================================================================
-- MIGRATION 056: Fix Pre-Existing Function Bugs
-- ============================================================================
-- What: Fix 6 broken database functions identified by supabase db lint
-- Why: Clean lint output (0 errors, 0 warnings)
-- Impact: No breaking changes - fixes functions that were already broken
-- ============================================================================

-- ============================================================================
-- FIX 1: is_admin() no-arg version
-- ============================================================================
-- Problem: References non-existent public.admin_users table
-- Fix: Point to public.user_roles (created in migration 055)

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================================
-- FIX 2: generate_quote_reference() missing explicit RETURN
-- ============================================================================
-- Problem: PL/pgSQL lint warns "control reached end of function without RETURN"
-- Fix: Add unreachable RETURN after LOOP (satisfies linter)

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
    ref := 'NTD-' || TO_CHAR(now(), 'MMDDYY-HH24MI');

    SELECT EXISTS(SELECT 1 FROM quotes WHERE reference_number = ref) INTO exists_check;

    IF NOT exists_check THEN
      RETURN ref;
    END IF;

    ref := ref || '-' || SUBSTR(MD5(random()::text), 1, 4);

    SELECT EXISTS(SELECT 1 FROM quotes WHERE reference_number = ref) INTO exists_check;
    IF NOT exists_check THEN
      RETURN ref;
    END IF;
  END LOOP;

  -- Unreachable, but satisfies PL/pgSQL lint
  RETURN 'NTD-ERROR';
END;
$$;

-- ============================================================================
-- FIX 3: validate_coupon() ambiguous column reference
-- ============================================================================
-- Problem: "coupon_id" is ambiguous - PL/pgSQL variable vs table column
-- Fix: Qualify column with table alias (cu.coupon_id)

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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_discount_amount INTEGER;
BEGIN
  SELECT * INTO v_coupon
  FROM coupons c
  WHERE UPPER(c.code) = UPPER(p_code)
  AND c.is_active = true
  AND c.starts_at <= now()
  AND (c.expires_at IS NULL OR c.expires_at > now());

  IF v_coupon IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 0, 'Invalid or expired coupon code'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'Coupon usage limit reached'::TEXT;
    RETURN;
  END IF;

  IF p_user_id IS NOT NULL AND v_coupon.max_uses_per_customer IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM coupon_usage cu
    WHERE cu.coupon_id = v_coupon.id AND cu.user_id = p_user_id;

    IF v_user_usage_count >= v_coupon.max_uses_per_customer THEN
      RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'You have already used this coupon'::TEXT;
      RETURN;
    END IF;
  END IF;

  IF v_coupon.minimum_order_amount > 0 AND p_cart_total < v_coupon.minimum_order_amount THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0,
      ('Minimum order of $' || (v_coupon.minimum_order_amount / 100.0)::TEXT || ' required')::TEXT;
    RETURN;
  END IF;

  IF v_coupon.minimum_quantity > 0 AND p_item_count < v_coupon.minimum_quantity THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0,
      ('Minimum ' || v_coupon.minimum_quantity || ' items required')::TEXT;
    RETURN;
  END IF;

  IF v_coupon.first_order_only AND NOT p_is_first_order THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'This coupon is for first orders only'::TEXT;
    RETURN;
  END IF;

  -- Calculate discount
  CASE v_coupon.discount_type
    WHEN 'percentage' THEN
      v_discount_amount := FLOOR(p_cart_total * (v_coupon.discount_value / 100));
    WHEN 'fixed_amount' THEN
      v_discount_amount := LEAST(v_coupon.discount_value * 100, p_cart_total)::INTEGER;
    WHEN 'free_shipping' THEN
      v_discount_amount := 0;
    ELSE
      v_discount_amount := 0;
  END CASE;

  RETURN QUERY SELECT true, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, v_discount_amount, NULL::TEXT;
END;
$$;

-- ============================================================================
-- FIX 4: format_price() wrong column name
-- ============================================================================
-- Problem: References v_currency.decimal_digits but column is decimal_places
-- Also: References v_currency.symbol_first but column is symbol_position

CREATE OR REPLACE FUNCTION format_price(
  p_amount DECIMAL,
  p_currency_code VARCHAR(3)
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_currency currencies%ROWTYPE;
  v_formatted TEXT;
BEGIN
  SELECT * INTO v_currency
  FROM currencies
  WHERE code = p_currency_code;

  IF v_currency IS NULL THEN
    RETURN p_amount::TEXT;
  END IF;

  v_formatted := ROUND(p_amount, v_currency.decimal_places)::TEXT;

  IF v_currency.symbol_position = 'before' THEN
    RETURN v_currency.symbol || v_formatted;
  ELSE
    RETURN v_formatted || ' ' || v_currency.symbol;
  END IF;
END;
$$;

-- ============================================================================
-- FIX 5: get_product_rating() references old view columns
-- ============================================================================
-- Problem: References review_count, five_star, etc. from old product_ratings view
-- Fix: Query reviews table directly and compute aggregates

CREATE OR REPLACE FUNCTION get_product_rating(p_product_id VARCHAR(255))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'product_id', p_product_id,
    'total_reviews', COUNT(*),
    'average_rating', COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0),
    'distribution', json_build_object(
      '5', COUNT(*) FILTER (WHERE r.rating = 5),
      '4', COUNT(*) FILTER (WHERE r.rating = 4),
      '3', COUNT(*) FILTER (WHERE r.rating = 3),
      '2', COUNT(*) FILTER (WHERE r.rating = 2),
      '1', COUNT(*) FILTER (WHERE r.rating = 1)
    ),
    'verified_purchases', COUNT(*) FILTER (WHERE r.is_verified_purchase = true)
  ) INTO v_result
  FROM reviews r
  WHERE r.product_id = p_product_id
    AND r.status = 'approved';

  IF v_result IS NULL THEN
    v_result := json_build_object(
      'product_id', p_product_id,
      'total_reviews', 0,
      'average_rating', 0,
      'distribution', json_build_object('5', 0, '4', 0, '3', 0, '2', 0, '1', 0),
      'verified_purchases', 0
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- FIX 6: create_quote_with_project_update() invalid enum value 'quoted'
-- ============================================================================
-- Problem: Sets status = 'quoted' but project_status enum doesn't include it
-- Fix: Add 'quoted' to the enum

ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'quoted';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After applying: supabase db lint
-- Expected: 0 errors, 0 warnings

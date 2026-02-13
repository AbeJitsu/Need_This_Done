-- ============================================================================
-- Fix Unused Variable Warnings
-- ============================================================================
-- What: Remove unused variables flagged by supabase db lint
-- Why: Clean lint output (0 errors, 0 warnings)
-- Impact: No behavior change
-- ============================================================================

-- FIX 1: create_quote_with_project_update() — remove unused v_reference_number
-- The variable is captured via RETURNING but never read; we only need v_quote_id.

CREATE OR REPLACE FUNCTION public.create_quote_with_project_update(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_project_id UUID,
  p_total_amount INTEGER,
  p_deposit_amount INTEGER,
  p_expires_at TIMESTAMPTZ,
  p_notes TEXT
)
RETURNS TABLE (
  id UUID,
  reference_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  project_id UUID,
  total_amount INTEGER,
  deposit_amount INTEGER,
  status TEXT,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_quote_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE public.projects.id = p_project_id) THEN
    RAISE EXCEPTION 'Project with ID % does not exist', p_project_id;
  END IF;

  INSERT INTO public.quotes (
    customer_name,
    customer_email,
    project_id,
    total_amount,
    deposit_amount,
    status,
    expires_at,
    notes
  )
  VALUES (
    p_customer_name,
    p_customer_email,
    p_project_id,
    p_total_amount,
    p_deposit_amount,
    'draft',
    p_expires_at,
    p_notes
  )
  RETURNING public.quotes.id INTO v_quote_id;

  UPDATE public.projects
  SET status = 'quoted',
      updated_at = NOW()
  WHERE public.projects.id = p_project_id;

  RETURN QUERY
  SELECT
    q.id,
    q.reference_number,
    q.customer_name,
    q.customer_email,
    q.project_id,
    q.total_amount,
    q.deposit_amount,
    q.status,
    q.expires_at,
    q.notes,
    q.created_at,
    q.updated_at
  FROM public.quotes q
  WHERE q.id = v_quote_id;
END;
$$;

-- FIX 2: validate_coupon() — use p_email for email-based usage tracking
-- Previously declared but never referenced, causing lint warning.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'validate_coupon'
  ) THEN
    EXECUTE $sql$
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
      AS $func$
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

        -- Check per-user usage by user_id or email fallback
        IF v_coupon.max_uses_per_customer IS NOT NULL THEN
          IF p_user_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_user_usage_count
            FROM coupon_usage cu
            WHERE cu.coupon_id = v_coupon.id AND cu.user_id = p_user_id;
          ELSIF p_email IS NOT NULL THEN
            SELECT COUNT(*) INTO v_user_usage_count
            FROM coupon_usage cu
            WHERE cu.coupon_id = v_coupon.id AND cu.email = p_email;
          ELSE
            v_user_usage_count := 0;
          END IF;

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
      $func$;
    $sql$;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- supabase db lint — Expected: 0 errors, 0 warnings

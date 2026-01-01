-- ============================================================================
-- Fix Function Search Paths
-- ============================================================================
-- Fixes Supabase security warnings for functions with mutable search_path.
-- All functions are recreated with SET search_path = public for security.
--
-- Why: Without a fixed search_path, attackers could create malicious objects
-- in another schema that would be found before the intended public schema objects.

-- ============================================================================
-- DROP FUNCTIONS WITH SIGNATURE CHANGES
-- ============================================================================
-- These functions need to be dropped first because we cannot change return type
-- or parameter types with CREATE OR REPLACE

DROP FUNCTION IF EXISTS download_template(UUID, UUID);
DROP FUNCTION IF EXISTS convert_currency(DECIMAL, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS convert_currency(INTEGER, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS format_price(DECIMAL, VARCHAR);
DROP FUNCTION IF EXISTS format_price(INTEGER, VARCHAR);

-- ============================================================================
-- TRIGGER FUNCTIONS (no SECURITY DEFINER)
-- ============================================================================

-- update_updated_at_column (from 002)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_enrollments_updated_at (from 023)
CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_coupon_timestamp (from 026)
CREATE OR REPLACE FUNCTION update_coupon_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_currency_timestamp (from 027)
CREATE OR REPLACE FUNCTION update_currency_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_review_timestamp (from 028)
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- update_report_count (from 028)
CREATE OR REPLACE FUNCTION update_report_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE reviews
  SET reported_count = (
    SELECT COUNT(*) FROM review_reports WHERE review_id = NEW.review_id
  )
  WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$;

-- update_template_rating (from 029)
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE marketplace_templates
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM template_reviews
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM template_reviews
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
        AND status = 'approved'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- update_template_timestamp (from 029)
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_media_updated_at (from 020)
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- set_published_at (from 005)
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- set_blog_published_at (from 021)
CREATE OR REPLACE FUNCTION set_blog_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  END IF;
  RETURN NEW;
END;
$$;

-- set_blog_published_at_on_insert (from 021)
CREATE OR REPLACE FUNCTION set_blog_published_at_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- create_status_update_comment (from 017)
CREATE OR REPLACE FUNCTION create_status_update_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_comments (
      project_id,
      user_id,
      content,
      is_system
    ) VALUES (
      NEW.id,
      NEW.user_id,
      format('Status changed from %s to %s', COALESCE(OLD.status::text, 'none'), NEW.status::text),
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

-- validate_business_hours (from 013)
CREATE OR REPLACE FUNCTION validate_business_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.preferred_time_start < '09:00:00'::time
     OR NEW.preferred_time_start > '17:00:00'::time THEN
    RAISE EXCEPTION 'Preferred time must be between 9 AM and 5 PM';
  END IF;

  IF EXTRACT(ISODOW FROM NEW.preferred_date) > 5 THEN
    RAISE EXCEPTION 'Preferred date must be a weekday (Monday-Friday)';
  END IF;

  IF NEW.alternate_time_start IS NOT NULL THEN
    IF NEW.alternate_time_start < '09:00:00'::time
       OR NEW.alternate_time_start > '17:00:00'::time THEN
      RAISE EXCEPTION 'Alternate time must be between 9 AM and 5 PM';
    END IF;
  END IF;

  IF NEW.alternate_date IS NOT NULL THEN
    IF EXTRACT(ISODOW FROM NEW.alternate_date) > 5 THEN
      RAISE EXCEPTION 'Alternate date must be a weekday (Monday-Friday)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- ADMIN CHECK FUNCTIONS
-- ============================================================================

-- is_admin (no args, from 003)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
END;
$$;

-- is_admin (with check_user_id arg, from 031)
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = check_user_id);
END;
$$;

-- ============================================================================
-- COUPON FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- validate_coupon (from 026)
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
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 0, 'Invalid or expired coupon code';
    RETURN;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'Coupon usage limit reached';
    RETURN;
  END IF;

  IF p_user_id IS NOT NULL AND v_coupon.max_uses_per_customer IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

    IF v_user_usage_count >= v_coupon.max_uses_per_customer THEN
      RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'You have already used this coupon';
      RETURN;
    END IF;
  END IF;

  IF v_coupon.minimum_order_amount > 0 AND p_cart_total < v_coupon.minimum_order_amount THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0,
      'Minimum order of $' || (v_coupon.minimum_order_amount / 100.0)::TEXT || ' required';
    RETURN;
  END IF;

  IF v_coupon.minimum_quantity > 0 AND p_item_count < v_coupon.minimum_quantity THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0,
      'Minimum ' || v_coupon.minimum_quantity || ' items required';
    RETURN;
  END IF;

  IF v_coupon.first_order_only AND NOT p_is_first_order THEN
    RETURN QUERY SELECT false, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 0, 'This coupon is for first orders only';
    RETURN;
  END IF;

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

-- apply_coupon (from 026)
CREATE OR REPLACE FUNCTION apply_coupon(
  p_coupon_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_order_id TEXT DEFAULT NULL,
  p_discount_applied INTEGER DEFAULT 0,
  p_order_total INTEGER DEFAULT 0,
  p_email TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_applied, order_total, email)
  VALUES (p_coupon_id, p_user_id, p_order_id, p_discount_applied, p_order_total, p_email);

  UPDATE coupons
  SET current_uses = current_uses + 1, updated_at = now()
  WHERE id = p_coupon_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ============================================================================
-- CURRENCY FUNCTIONS (SECURITY DEFINER)
-- Exact signatures from migration 027
-- ============================================================================

-- convert_currency (from 027) - takes DECIMAL, returns DECIMAL
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount DECIMAL,
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3)
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate DECIMAL;
  v_converted DECIMAL;
BEGIN
  IF p_from_currency = p_to_currency THEN
    RETURN p_amount;
  END IF;

  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND (expires_at IS NULL OR expires_at > NOW());

  IF v_rate IS NULL THEN
    SELECT 1.0 / rate INTO v_rate
    FROM exchange_rates
    WHERE from_currency = p_to_currency
      AND to_currency = p_from_currency
      AND (expires_at IS NULL OR expires_at > NOW());
  END IF;

  IF v_rate IS NULL THEN
    RETURN NULL;
  END IF;

  v_converted := p_amount * v_rate;
  RETURN v_converted;
END;
$$;

-- format_price (from 027) - takes DECIMAL, returns TEXT
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
  v_integer_part TEXT;
  v_decimal_part TEXT;
  v_temp TEXT;
  v_i INTEGER;
BEGIN
  SELECT * INTO v_currency
  FROM currencies
  WHERE code = p_currency_code;

  IF v_currency IS NULL THEN
    RETURN p_amount::TEXT;
  END IF;

  v_formatted := ROUND(p_amount, v_currency.decimal_digits)::TEXT;

  IF v_currency.symbol_first THEN
    RETURN v_currency.symbol || v_formatted;
  ELSE
    RETURN v_formatted || ' ' || v_currency.symbol;
  END IF;
END;
$$;

-- ============================================================================
-- REVIEW FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- get_product_rating (from 028)
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
    'product_id', product_id,
    'total_reviews', review_count,
    'average_rating', average_rating,
    'distribution', json_build_object(
      '5', five_star,
      '4', four_star,
      '3', three_star,
      '2', two_star,
      '1', one_star
    ),
    'verified_purchases', 0
  ) INTO v_result
  FROM product_ratings
  WHERE product_id = p_product_id;

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

-- vote_on_review (from 028)
CREATE OR REPLACE FUNCTION vote_on_review(
  p_review_id UUID,
  p_vote_type VARCHAR(20),
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_vote review_votes%ROWTYPE;
BEGIN
  IF p_vote_type NOT IN ('helpful', 'not_helpful') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid vote type');
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_existing_vote
    FROM review_votes
    WHERE review_id = p_review_id AND user_id = p_user_id;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT * INTO v_existing_vote
    FROM review_votes
    WHERE review_id = p_review_id AND session_id = p_session_id;
  ELSE
    RETURN json_build_object('success', false, 'error', 'User or session required');
  END IF;

  IF v_existing_vote.id IS NOT NULL THEN
    IF v_existing_vote.vote_type = p_vote_type THEN
      DELETE FROM review_votes WHERE id = v_existing_vote.id;
      IF p_vote_type = 'helpful' THEN
        UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = p_review_id;
      END IF;
      RETURN json_build_object('success', true, 'action', 'removed');
    ELSE
      UPDATE review_votes SET vote_type = p_vote_type WHERE id = v_existing_vote.id;
      IF p_vote_type = 'helpful' THEN
        UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = p_review_id;
      ELSE
        UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = p_review_id;
      END IF;
      RETURN json_build_object('success', true, 'action', 'changed');
    END IF;
  END IF;

  INSERT INTO review_votes (review_id, user_id, session_id, vote_type)
  VALUES (p_review_id, p_user_id, p_session_id, p_vote_type);

  IF p_vote_type = 'helpful' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = p_review_id;
  END IF;

  RETURN json_build_object('success', true, 'action', 'created');
END;
$$;

-- ============================================================================
-- TEMPLATE MARKETPLACE FUNCTIONS (SECURITY DEFINER)
-- Exact signature from migration 029 - returns JSONB, no defaults
-- ============================================================================

-- download_template (from 029)
CREATE OR REPLACE FUNCTION download_template(
  p_template_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template marketplace_templates%ROWTYPE;
  v_purchase template_purchases%ROWTYPE;
BEGIN
  SELECT * INTO v_template
  FROM marketplace_templates
  WHERE id = p_template_id AND status = 'approved';

  IF v_template.id IS NULL THEN
    RETURN jsonb_build_object('error', 'Template not found');
  END IF;

  IF v_template.price_type = 'paid' THEN
    SELECT * INTO v_purchase
    FROM template_purchases
    WHERE template_id = p_template_id AND user_id = p_user_id;

    IF v_purchase.id IS NULL THEN
      RETURN jsonb_build_object('error', 'Purchase required');
    END IF;
  END IF;

  INSERT INTO template_purchases (template_id, user_id, downloaded_at, download_count)
  VALUES (p_template_id, p_user_id, NOW(), 1)
  ON CONFLICT (template_id, user_id)
  DO UPDATE SET
    downloaded_at = NOW(),
    download_count = template_purchases.download_count + 1;

  UPDATE marketplace_templates
  SET download_count = download_count + 1
  WHERE id = p_template_id;

  RETURN jsonb_build_object(
    'success', true,
    'content', v_template.content,
    'name', v_template.name
  );
END;
$$;

-- ============================================================================
-- PRODUCT INTERACTION FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- record_product_interaction (from 025)
CREATE OR REPLACE FUNCTION record_product_interaction(
  p_product_id VARCHAR(255),
  p_interaction_type VARCHAR(50),
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interaction_id UUID;
BEGIN
  INSERT INTO product_interactions (
    product_id,
    interaction_type,
    user_id,
    session_id,
    metadata
  )
  VALUES (
    p_product_id,
    p_interaction_type,
    p_user_id,
    p_session_id,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_interaction_id;

  RETURN v_interaction_id;
END;
$$;

-- ============================================================================
-- VECTOR SEARCH FUNCTION
-- ============================================================================

-- match_page_embeddings (from 008)
CREATE OR REPLACE FUNCTION match_page_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  page_url text,
  page_title text,
  content_chunk text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.page_url,
    pe.page_title,
    pe.content_chunk,
    pe.metadata,
    1 - (pe.embedding <=> query_embedding) as similarity
  FROM page_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- Done! All functions now have fixed search_path = public
-- ============================================================================

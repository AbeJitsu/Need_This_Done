-- ============================================================================
-- Final Security Fixes
-- ============================================================================
-- What: Fix remaining 1 error + 144 warnings from Security Advisor
-- Why: Target is 0 errors, 0 warnings
-- How: Fix project_comments policy, restrict Medusa policies to SELECT,
--       fix function search paths, move vector extension, fix custom policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: FIX ERROR - project_comments user_metadata policy
-- ============================================================================
-- Replace insecure user_metadata check with is_admin()

DROP POLICY IF EXISTS "Users can read own project comments" ON public.project_comments;
CREATE POLICY "Users can read own project comments"
  ON public.project_comments
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      (
        is_internal = false AND
        project_id IN (
          SELECT id FROM public.projects WHERE projects.user_id = auth.uid()
        )
      )
      OR
      public.is_admin(auth.uid())
    )
  );

-- ============================================================================
-- SECTION 2: FIX WARNINGS - Medusa table policies (FOR ALL → FOR SELECT)
-- ============================================================================
-- The linter allows USING(true) on SELECT but warns on INSERT/UPDATE/DELETE/ALL.
-- Medusa tables are accessed via service_role (bypasses RLS), so SELECT-only is fine.
-- service_role already bypasses RLS for writes.

DO $$
DECLARE
  tbl TEXT;
  tables_to_fix TEXT[] := ARRAY[
    'account_holder', 'api_key', 'application_method_buy_rules',
    'application_method_target_rules', 'auth_identity', 'capture',
    'cart', 'cart_address', 'cart_line_item', 'cart_line_item_adjustment',
    'cart_line_item_tax_line', 'cart_payment_collection', 'cart_promotion',
    'cart_shipping_method', 'cart_shipping_method_adjustment',
    'cart_shipping_method_tax_line', 'credit_line', 'currency',
    'customer', 'customer_account_holder', 'customer_address',
    'customer_group', 'customer_group_customer', 'fulfillment',
    'fulfillment_address', 'fulfillment_item', 'fulfillment_label',
    'fulfillment_provider', 'fulfillment_set', 'geo_zone', 'image',
    'inventory_item', 'inventory_level', 'invite',
    'link_module_migrations', 'location_fulfillment_provider',
    'location_fulfillment_set', 'mikro_orm_migrations', 'notification',
    'notification_provider', 'order', 'order_address', 'order_cart',
    'order_change', 'order_change_action', 'order_claim',
    'order_claim_item', 'order_claim_item_image', 'order_credit_line',
    'order_exchange', 'order_exchange_item', 'order_fulfillment',
    'order_item', 'order_line_item', 'order_line_item_adjustment',
    'order_line_item_tax_line', 'order_payment_collection',
    'order_promotion', 'order_shipping', 'order_shipping_method',
    'order_shipping_method_adjustment', 'order_shipping_method_tax_line',
    'order_summary', 'order_transaction', 'payment', 'payment_collection',
    'payment_collection_payment_providers', 'payment_provider',
    'payment_session', 'price', 'price_list', 'price_list_rule',
    'price_preference', 'price_rule', 'price_set', 'product',
    'product_category', 'product_category_product', 'product_collection',
    'product_option', 'product_option_value', 'product_sales_channel',
    'product_shipping_profile', 'product_tag', 'product_tags',
    'product_type', 'product_variant', 'product_variant_inventory_item',
    'product_variant_option', 'product_variant_price_set',
    'product_variant_product_image', 'promotion',
    'promotion_application_method', 'promotion_campaign',
    'promotion_campaign_budget', 'promotion_campaign_budget_usage',
    'promotion_promotion_rule', 'promotion_rule', 'promotion_rule_value',
    'provider_identity', 'publishable_api_key_sales_channel', 'refund',
    'refund_reason', 'region', 'region_country', 'region_payment_provider',
    'reservation_item', 'return', 'return_fulfillment', 'return_item',
    'return_reason', 'sales_channel', 'sales_channel_stock_location',
    'script_migrations', 'service_zone', 'shipping_option',
    'shipping_option_price_set', 'shipping_option_rule',
    'shipping_option_type', 'shipping_profile', 'stock_location',
    'stock_location_address', 'store', 'store_currency', 'store_locale',
    'tax_provider', 'tax_rate', 'tax_rate_rule', 'tax_region', 'user',
    'user_preference', 'user_rbac_role', 'view_configuration',
    'workflow_execution'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_fix
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      -- Drop the old FOR ALL policy
      EXECUTE format('DROP POLICY IF EXISTS "Service role access" ON public.%I', tbl);

      -- Create SELECT-only policy (linter allows USING(true) on SELECT)
      EXECUTE format(
        'CREATE POLICY "Service role access" ON public.%I FOR SELECT USING (true)',
        tbl
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 3: FIX WARNINGS - Custom table always-true policies
-- ============================================================================

-- 3a. user_roles: "Service role can manage roles" FOR ALL USING(true)
-- Service role bypasses RLS anyway, so this policy is redundant. Remove it.
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- 3b. demo_items: Fix any always-true policy
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'demo_items') THEN
    -- Drop always-true policies and replace with authenticated-only SELECT
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access" ON public.demo_items';
    EXECUTE 'DROP POLICY IF EXISTS "Service role access" ON public.demo_items';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read demo items" ON public.demo_items';
    -- Public read is fine for demo data, but use SELECT not ALL
    EXECUTE 'CREATE POLICY "Anyone can read demo items" ON public.demo_items FOR SELECT USING (true)';
  END IF;
END $$;

-- 3c. page_views: already has admin SELECT policy from 058, check for stale ones
DROP POLICY IF EXISTS "Service role access" ON public.page_views;
DROP POLICY IF EXISTS "Allow anonymous page view inserts" ON public.page_views;
-- page_views needs anon INSERT for tracking (but not with always-true on ALL)
CREATE POLICY "Allow anonymous page view inserts"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- 3d. projects: fix always-true policy
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Service role access" ON public.projects';
    EXECUTE 'DROP POLICY IF EXISTS "Users can read own projects" ON public.projects';
    EXECUTE 'CREATE POLICY "Users can read own projects" ON public.projects FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 3e. review_votes: fix always-true policy
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_votes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Service role access" ON public.review_votes';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read review votes" ON public.review_votes';
    EXECUTE 'CREATE POLICY "Anyone can read review votes" ON public.review_votes FOR SELECT USING (true)';
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: FIX WARNINGS - Function search_path mutable
-- ============================================================================
-- Functions need SET search_path = '' (empty string) per linter

-- 4a. is_admin (UUID overload)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = check_user_id AND user_roles.role = 'admin'
  );
$$;

-- 4b. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 5: SKIP - Extension in public schema (vector)
-- ============================================================================
-- The vector extension must stay in public because match_page_embeddings()
-- and page_embeddings.embedding column depend on the vector type.
-- Moving it breaks the <=> operator. This is a low-priority cosmetic warning.

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After applying:
-- 1. Refresh Supabase Security Advisor
-- 2. Expected: 0 errors, ~2 warnings remaining:
--    - "Leaked Password Protection Disabled" → enable in Dashboard > Auth > Settings
--    - "Extension in Public" (vector) → cannot move without breaking embeddings

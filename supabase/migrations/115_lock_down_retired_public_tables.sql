-- Lock down the retired commerce/Medusa tables still present in the hosted public schema.
-- This is a non-destructive security repair: it preserves tables and data,
-- but removes browser-role access and enables RLS so the retired tables are
-- not reachable through the Supabase API. Server-side service_role access is
-- retained explicitly for controlled cleanup or archival work.
--
-- The allowlist matches the 134-table Medusa set removed from the application
-- contract by migration 092. Keep this list explicit so newly created
-- application tables are not accidentally locked down by this repair.

DO $$
DECLARE
  table_name text;
  policy_name text;
  retired_tables text[] := ARRAY[
    'account_holder',
    'api_key',
    'application_method_buy_rules',
    'application_method_target_rules',
    'auth_identity',
    'capture',
    'cart',
    'cart_address',
    'cart_line_item',
    'cart_line_item_adjustment',
    'cart_line_item_tax_line',
    'cart_payment_collection',
    'cart_promotion',
    'cart_shipping_method',
    'cart_shipping_method_adjustment',
    'cart_shipping_method_tax_line',
    'credit_line',
    'currency',
    'customer',
    'customer_account_holder',
    'customer_address',
    'customer_group',
    'customer_group_customer',
    'fulfillment',
    'fulfillment_address',
    'fulfillment_item',
    'fulfillment_label',
    'fulfillment_provider',
    'fulfillment_set',
    'geo_zone',
    'image',
    'inventory_item',
    'inventory_level',
    'invite',
    'link_module_migrations',
    'location_fulfillment_provider',
    'location_fulfillment_set',
    'mikro_orm_migrations',
    'notification',
    'notification_provider',
    'order',
    'order_address',
    'order_cart',
    'order_change',
    'order_change_action',
    'order_claim',
    'order_claim_item',
    'order_claim_item_image',
    'order_credit_line',
    'order_exchange',
    'order_exchange_item',
    'order_fulfillment',
    'order_item',
    'order_line_item',
    'order_line_item_adjustment',
    'order_line_item_tax_line',
    'order_payment_collection',
    'order_promotion',
    'order_shipping',
    'order_shipping_method',
    'order_shipping_method_adjustment',
    'order_shipping_method_tax_line',
    'order_summary',
    'order_transaction',
    'payment',
    'payment_collection',
    'payment_collection_payment_providers',
    'payment_provider',
    'payment_session',
    'price',
    'price_list',
    'price_list_rule',
    'price_preference',
    'price_rule',
    'price_set',
    'product',
    'product_category',
    'product_category_product',
    'product_collection',
    'product_option',
    'product_option_value',
    'product_sales_channel',
    'product_shipping_profile',
    'product_tag',
    'product_tags',
    'product_type',
    'product_variant',
    'product_variant_inventory_item',
    'product_variant_option',
    'product_variant_price_set',
    'product_variant_product_image',
    'promotion',
    'promotion_application_method',
    'promotion_campaign',
    'promotion_campaign_budget',
    'promotion_campaign_budget_usage',
    'promotion_promotion_rule',
    'promotion_rule',
    'promotion_rule_value',
    'provider_identity',
    'publishable_api_key_sales_channel',
    'refund',
    'refund_reason',
    'region',
    'region_country',
    'region_payment_provider',
    'reservation_item',
    'return',
    'return_fulfillment',
    'return_item',
    'return_reason',
    'sales_channel',
    'sales_channel_stock_location',
    'script_migrations',
    'service_zone',
    'shipping_option',
    'shipping_option_price_set',
    'shipping_option_rule',
    'shipping_option_type',
    'shipping_profile',
    'stock_location',
    'stock_location_address',
    'store',
    'store_currency',
    'store_locale',
    'tax_provider',
    'tax_rate',
    'tax_rate_rule',
    'tax_region',
    'user',
    'user_preference',
    'user_rbac_role',
    'view_configuration',
    'workflow_execution'
  ];
BEGIN
  FOREACH table_name IN ARRAY retired_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      FOR policy_name IN
        SELECT p.policyname
        FROM pg_policies AS p
        WHERE p.schemaname = 'public'
          AND p.tablename = table_name
      LOOP
        EXECUTE format(
          'DROP POLICY IF EXISTS %I ON public.%I',
          policy_name,
          table_name
        );
      END LOOP;

      EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
        table_name
      );
      EXECUTE format(
        'REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        table_name
      );
      EXECUTE format(
        'GRANT ALL ON TABLE public.%I TO service_role',
        table_name
      );
    END IF;
  END LOOP;
END $$;

-- OAuth token rows are server-side secrets. The prior owner-read policy
-- exposed every column in a token row to the owning browser session.
DO $$
BEGIN
  IF to_regclass('public.google_calendar_tokens') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can read own tokens" ON public.google_calendar_tokens';
    EXECUTE 'DROP POLICY IF EXISTS "Service role can manage tokens" ON public.google_calendar_tokens';
    EXECUTE 'CREATE POLICY "Service role can manage tokens" ON public.google_calendar_tokens FOR ALL TO service_role USING (true) WITH CHECK (true)';
    EXECUTE 'REVOKE ALL ON TABLE public.google_calendar_tokens FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT ALL ON TABLE public.google_calendar_tokens TO service_role';
  END IF;
END $$;

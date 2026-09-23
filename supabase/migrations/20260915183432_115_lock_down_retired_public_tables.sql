-- Lock down retired public tables that can survive a partial or out-of-band
-- cleanup of the legacy commerce schema.
--
-- Purpose: close the anonymous PostgREST exposure found on 2026-09-15. The
-- hosted project still exposes the retired public.api_key relation, including
-- token-like data, even though the repository's retirement migration removes
-- it from a clean schema.
-- Impact: existing retired tables and rows are preserved. If a listed table
-- exists, browser roles lose all table privileges and all existing policies
-- are removed; service_role retains server-only full table access. The normal
-- migration path remains compatible because the operation is a no-op after
-- migration 092 has removed the tables.
-- Data handling: this migration does not select, copy, log, or delete table
-- data. It changes only RLS state, policies, and table grants.
-- Verification: run the local schema/RLS suites, then re-run Supabase
-- Advisors and an anonymous REST metadata/count probe after any separately
-- approved hosted application.
-- Rollback: do not re-grant browser access or restore permissive policies.
-- Use a separately reviewed forward migration if a retired server-side caller
-- needs a narrowly scoped replacement grant.

do $$
declare
  retired_table text;
  policy_row record;
  retired_tables constant text[] := array[
    'appointment_notification_log', 'appointment_reminders', 'appointment_requests',
    'campaign_clicks', 'campaign_opens', 'campaign_recipients', 'email_campaigns',
    'email_templates', 'loyalty_redemptions', 'loyalty_points',
    'loyalty_points_config', 'referral_credit_usage', 'referral_transactions',
    'customer_referrals', 'product_category_mappings', 'product_categories',
    'product_waitlist', 'saved_addresses', 'waitlist_campaign_recipients',
    'waitlist_campaigns', 'payment_attempts', 'webhook_events',
    'page_content_history', 'enrollments', 'page_content', 'page_embeddings',
    'page_views', 'pages', 'blog_posts', 'changelog_entries', 'media',
    'review_reports', 'review_votes', 'template_reviews', 'template_purchases',
    'product_similarities', 'product_interactions', 'coupon_usage',
    'user_currency_preferences', 'exchange_rates', 'payments', 'cart_reminders',
    'orders', 'quotes', 'reviews', 'marketplace_templates', 'template_categories',
    'coupons', 'currencies', 'stripe_customers', 'subscriptions', 'demo_items',
    'wizard_sessions',
    'account_holder', 'api_key', 'application_method_buy_rules',
    'application_method_target_rules', 'auth_identity', 'capture', 'cart',
    'cart_address', 'cart_line_item', 'cart_line_item_adjustment',
    'cart_line_item_tax_line', 'cart_payment_collection', 'cart_promotion',
    'cart_shipping_method', 'cart_shipping_method_adjustment',
    'cart_shipping_method_tax_line', 'credit_line', 'currency', 'customer',
    'customer_account_holder', 'customer_address', 'customer_group',
    'customer_group_customer', 'fulfillment', 'fulfillment_address',
    'fulfillment_item', 'fulfillment_label', 'fulfillment_provider',
    'fulfillment_set', 'geo_zone', 'image', 'inventory_item', 'inventory_level',
    'invite', 'link_module_migrations', 'location_fulfillment_provider',
    'location_fulfillment_set', 'mikro_orm_migrations', 'notification',
    'notification_provider', 'order', 'order_address', 'order_cart',
    'order_change', 'order_change_action', 'order_claim', 'order_claim_item',
    'order_claim_item_image', 'order_credit_line', 'order_exchange',
    'order_exchange_item', 'order_fulfillment', 'order_item',
    'order_line_item', 'order_line_item_adjustment', 'order_line_item_tax_line',
    'order_payment_collection', 'order_promotion', 'order_shipping',
    'order_shipping_method', 'order_shipping_method_adjustment',
    'order_shipping_method_tax_line', 'order_summary', 'order_transaction',
    'payment', 'payment_collection', 'payment_collection_payment_providers',
    'payment_provider', 'payment_session', 'price', 'price_list',
    'price_list_rule', 'price_preference', 'price_rule', 'price_set', 'product',
    'product_category', 'product_category_product', 'product_collection',
    'product_option', 'product_option_value', 'product_sales_channel',
    'product_shipping_profile', 'product_tag', 'product_tags', 'product_type',
    'product_variant', 'product_variant_inventory_item', 'product_variant_option',
    'product_variant_price_set', 'product_variant_product_image', 'promotion',
    'promotion_application_method', 'promotion_campaign',
    'promotion_campaign_budget', 'promotion_campaign_budget_usage',
    'promotion_promotion_rule', 'promotion_rule', 'promotion_rule_value',
    'provider_identity', 'publishable_api_key_sales_channel', 'refund',
    'refund_reason', 'region', 'region_country', 'region_payment_provider',
    'reservation_item', 'return', 'return_fulfillment', 'return_item',
    'return_reason', 'sales_channel', 'sales_channel_stock_location',
    'script_migrations', 'service_zone', 'shipping_option',
    'shipping_option_price_set', 'shipping_option_rule', 'shipping_option_type',
    'shipping_profile', 'stock_location', 'stock_location_address', 'store',
    'store_currency', 'store_locale', 'tax_provider', 'tax_rate',
    'tax_rate_rule', 'tax_region', 'user', 'user_preference', 'user_rbac_role',
    'view_configuration', 'workflow_execution'
  ];
begin
  foreach retired_table in array retired_tables
  loop
    if exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = retired_table
        and c.relkind in ('r', 'p')
    ) then
      execute format(
        'alter table %I.%I enable row level security',
        'public',
        retired_table
      );

      -- Historical migrations used a public policy with this label. Remove
      -- every policy so no unknown permissive policy survives the correction.
      for policy_row in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = retired_table
      loop
        execute format(
          'drop policy if exists %I on %I.%I',
          policy_row.policyname,
          policy_row.schemaname,
          policy_row.tablename
        );
      end loop;

      execute format(
        'revoke all on table %I.%I from public, anon, authenticated',
        'public',
        retired_table
      );
      execute format(
        'grant all on table %I.%I to service_role',
        'public',
        retired_table
      );
    end if;
  end loop;
end $$;

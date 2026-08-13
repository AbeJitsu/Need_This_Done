-- Remove the retired marketplace and commerce contract. Child relations,
-- views, and functions are removed before parents. RESTRICT is intentional:
-- retained or unknown dependencies must stop review rather than cascade.

do $$
declare object record;
begin
  for object in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(array[
      'review_reports','review_votes','template_reviews','template_purchases','product_similarities',
      'product_interactions','coupon_usage','user_currency_preferences','exchange_rates','payments',
      'cart_reminders','orders','quotes','reviews','marketplace_templates','template_categories',
      'coupons','currencies','stripe_customers','subscriptions','demo_items','wizard_sessions'
    ])
  loop execute format('drop policy %I on %I.%I', object.policyname, object.schemaname, object.tablename); end loop;
  for object in select distinct event_object_schema as schemaname, event_object_table as tablename, trigger_name from information_schema.triggers
    where event_object_schema = 'public' and event_object_table = any(array[
      'review_reports','review_votes','template_reviews','template_purchases','product_similarities',
      'product_interactions','coupon_usage','user_currency_preferences','exchange_rates','payments',
      'cart_reminders','orders','quotes','reviews','marketplace_templates','template_categories',
      'coupons','currencies','stripe_customers','subscriptions','demo_items','wizard_sessions'
    ])
  loop execute format('drop trigger %I on %I.%I', object.trigger_name, object.schemaname, object.tablename); end loop;
end $$;

drop view if exists public.cart_reminder_stats restrict;
drop view if exists public.featured_templates restrict;
drop view if exists public.popular_products restrict;
drop view if exists public.popular_templates restrict;
drop view if exists public.product_ratings restrict;
drop view if exists public.trending_products restrict;

drop function if exists public.apply_coupon(uuid, uuid, text, integer, integer, text) restrict;
drop function if exists public.calculate_deposit_amount(integer) restrict;
drop function if exists public.convert_currency(numeric, character varying, character varying) restrict;
drop function if exists public.create_quote_with_project_update(text, text, uuid, integer, integer, timestamptz, text) restrict;
drop function if exists public.download_template(uuid, uuid) restrict;
drop function if exists public.format_price(numeric, character varying) restrict;
drop function if exists public.generate_quote_reference() restrict;
drop function if exists public.get_product_rating(character varying) restrict;
drop function if exists public.has_pending_final_payment(uuid) restrict;
drop function if exists public.record_product_interaction(text, text, uuid, text, text, text, text) restrict;
drop function if exists public.update_coupon_timestamp() restrict;
drop function if exists public.update_currency_timestamp() restrict;
drop function if exists public.update_quotes_updated_at() restrict;
drop function if exists public.update_report_count() restrict;
drop function if exists public.update_review_timestamp() restrict;
drop function if exists public.update_template_rating() restrict;
drop function if exists public.update_template_timestamp() restrict;
drop function if exists public.validate_coupon(text, integer, integer, uuid, text, boolean) restrict;
drop function if exists public.vote_on_review(uuid, character varying, uuid, character varying) restrict;

drop table if exists public.review_reports restrict;
drop table if exists public.review_votes restrict;
drop table if exists public.template_reviews restrict;
drop table if exists public.template_purchases restrict;
drop table if exists public.product_similarities restrict;
drop table if exists public.product_interactions restrict;
drop table if exists public.coupon_usage restrict;
drop table if exists public.user_currency_preferences restrict;
drop table if exists public.exchange_rates restrict;
drop table if exists public.payments restrict;
drop table if exists public.cart_reminders restrict;
drop table if exists public.orders restrict;
drop table if exists public.quotes restrict;
drop table if exists public.reviews restrict;
drop table if exists public.marketplace_templates restrict;
drop table if exists public.template_categories restrict;
drop table if exists public.coupons restrict;
drop table if exists public.currencies restrict;
drop table if exists public.stripe_customers restrict;
drop table if exists public.subscriptions restrict;
drop table if exists public.demo_items restrict;
drop table if exists public.wizard_sessions restrict;

-- Remove the hosted Medusa v2 schema that was created outside repository
-- migrations. The list is explicit from the restricted pre-cutover schema
-- inventory. Only foreign keys owned by these retired tables are removed;
-- retained or unknown dependencies still stop each RESTRICTed table drop.
do $$
declare
  retired_tables text[] := array[
    'account_holder','api_key','application_method_buy_rules','application_method_target_rules',
    'auth_identity','capture','cart','cart_address','cart_line_item','cart_line_item_adjustment',
    'cart_line_item_tax_line','cart_payment_collection','cart_promotion','cart_shipping_method',
    'cart_shipping_method_adjustment','cart_shipping_method_tax_line','credit_line','currency',
    'customer','customer_account_holder','customer_address','customer_group','customer_group_customer',
    'fulfillment','fulfillment_address','fulfillment_item','fulfillment_label','fulfillment_provider',
    'fulfillment_set','geo_zone','image','inventory_item','inventory_level','invite',
    'link_module_migrations','location_fulfillment_provider','location_fulfillment_set',
    'mikro_orm_migrations','notification','notification_provider','order','order_address','order_cart',
    'order_change','order_change_action','order_claim','order_claim_item','order_claim_item_image',
    'order_credit_line','order_exchange','order_exchange_item','order_fulfillment','order_item',
    'order_line_item','order_line_item_adjustment','order_line_item_tax_line','order_payment_collection',
    'order_promotion','order_shipping','order_shipping_method','order_shipping_method_adjustment',
    'order_shipping_method_tax_line','order_summary','order_transaction','payment','payment_collection',
    'payment_collection_payment_providers','payment_provider','payment_session','price','price_list',
    'price_list_rule','price_preference','price_rule','price_set','product','product_category',
    'product_category_product','product_collection','product_option','product_option_value',
    'product_sales_channel','product_shipping_profile','product_tag','product_tags','product_type',
    'product_variant','product_variant_inventory_item','product_variant_option','product_variant_price_set',
    'product_variant_product_image','promotion','promotion_application_method','promotion_campaign',
    'promotion_campaign_budget','promotion_campaign_budget_usage','promotion_promotion_rule',
    'promotion_rule','promotion_rule_value','provider_identity','publishable_api_key_sales_channel',
    'refund','refund_reason','region','region_country','region_payment_provider','reservation_item',
    'return','return_fulfillment','return_item','return_reason','sales_channel',
    'sales_channel_stock_location','script_migrations','service_zone','shipping_option',
    'shipping_option_price_set','shipping_option_rule','shipping_option_type','shipping_profile',
    'stock_location','stock_location_address','store','store_currency','store_locale','tax_provider',
    'tax_rate','tax_rate_rule','tax_region','user','user_preference','user_rbac_role',
    'view_configuration','workflow_execution'
  ];
  object record;
  table_name text;
begin
  for object in
    select n.nspname as schema_name, c.relname as table_name, constraint_record.conname
    from pg_constraint constraint_record
    join pg_class c on c.oid = constraint_record.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where constraint_record.contype = 'f'
      and n.nspname = 'public'
      and c.relname = any(retired_tables)
  loop
    execute format(
      'alter table %I.%I drop constraint %I',
      object.schema_name,
      object.table_name,
      object.conname
    );
  end loop;

  foreach table_name in array retired_tables
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('drop table public.%I restrict', table_name);
    end if;
  end loop;
end $$;

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'medusa') then
    drop schema medusa restrict;
  end if;
end $$;

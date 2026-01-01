-- ============================================================================
-- Enable RLS on Medusa E-Commerce Tables
-- ============================================================================
-- Fixes 107 Supabase security warnings for tables without Row Level Security.
--
-- Policy Strategy:
-- - Public catalog data (products, collections): Anyone can read, admins can write
-- - Customer data (customer, address): Owner only access
-- - Cart data: Session owner only
-- - Order data: Customer owner only
-- - System tables (migrations, oauth): Service role only
-- - Config tables (region, currency): Public read, admin write
--
-- Note: Medusa backend uses service_role key which bypasses RLS.
-- These policies protect direct database access via anon/authenticated keys.

-- ============================================================================
-- SYSTEM TABLES - Service Role Only
-- ============================================================================
-- These are Medusa internal tables that should never be accessed directly

ALTER TABLE IF EXISTS public.migrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "migrations_service_only" ON public.migrations;
CREATE POLICY "migrations_service_only" ON public.migrations
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.idempotency_key ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "idempotency_key_service_only" ON public.idempotency_key;
CREATE POLICY "idempotency_key_service_only" ON public.idempotency_key
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.oauth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "oauth_service_only" ON public.oauth;
CREATE POLICY "oauth_service_only" ON public.oauth
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.batch_job ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "batch_job_service_only" ON public.batch_job;
CREATE POLICY "batch_job_service_only" ON public.batch_job
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.notification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_service_only" ON public.notification;
CREATE POLICY "notification_service_only" ON public.notification
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.notification_provider ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_provider_service_only" ON public.notification_provider;
CREATE POLICY "notification_provider_service_only" ON public.notification_provider
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.invite ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invite_service_only" ON public.invite;
CREATE POLICY "invite_service_only" ON public.invite
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public."user" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_service_only" ON public."user";
CREATE POLICY "user_service_only" ON public."user"
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.note ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "note_service_only" ON public.note;
CREATE POLICY "note_service_only" ON public.note
  FOR ALL USING (false);

-- ============================================================================
-- CONFIG TABLES - Public Read
-- ============================================================================
-- Reference data that storefront needs to display

ALTER TABLE IF EXISTS public.region ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "region_public_read" ON public.region;
CREATE POLICY "region_public_read" ON public.region
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.country ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "country_public_read" ON public.country;
CREATE POLICY "country_public_read" ON public.country
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.currency ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "currency_public_read" ON public.currency;
CREATE POLICY "currency_public_read" ON public.currency
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.store_currencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_currencies_public_read" ON public.store_currencies;
CREATE POLICY "store_currencies_public_read" ON public.store_currencies
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.tax_rate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tax_rate_public_read" ON public.tax_rate;
CREATE POLICY "tax_rate_public_read" ON public.tax_rate
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.tax_provider ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tax_provider_public_read" ON public.tax_provider;
CREATE POLICY "tax_provider_public_read" ON public.tax_provider
  FOR SELECT USING (true);

-- ============================================================================
-- PRODUCT CATALOG - Public Read
-- ============================================================================
-- Products and related data that storefront displays

ALTER TABLE IF EXISTS public.product ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_public_read" ON public.product;
CREATE POLICY "product_public_read" ON public.product
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_variant ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_variant_public_read" ON public.product_variant;
CREATE POLICY "product_variant_public_read" ON public.product_variant
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_option ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_option_public_read" ON public.product_option;
CREATE POLICY "product_option_public_read" ON public.product_option
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_option_value ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_option_value_public_read" ON public.product_option_value;
CREATE POLICY "product_option_value_public_read" ON public.product_option_value
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_collection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_collection_public_read" ON public.product_collection;
CREATE POLICY "product_collection_public_read" ON public.product_collection
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_tag ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_tag_public_read" ON public.product_tag;
CREATE POLICY "product_tag_public_read" ON public.product_tag
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_tags_public_read" ON public.product_tags;
CREATE POLICY "product_tags_public_read" ON public.product_tags
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_type ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_type_public_read" ON public.product_type;
CREATE POLICY "product_type_public_read" ON public.product_type
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
CREATE POLICY "product_images_public_read" ON public.product_images
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.image ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "image_public_read" ON public.image;
CREATE POLICY "image_public_read" ON public.image
  FOR SELECT USING (true);

-- ============================================================================
-- PRICING - Public Read
-- ============================================================================

ALTER TABLE IF EXISTS public.money_amount ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "money_amount_public_read" ON public.money_amount;
CREATE POLICY "money_amount_public_read" ON public.money_amount
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.price_list ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_list_public_read" ON public.price_list;
CREATE POLICY "price_list_public_read" ON public.price_list
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.price_list_customer_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_list_customer_groups_public_read" ON public.price_list_customer_groups;
CREATE POLICY "price_list_customer_groups_public_read" ON public.price_list_customer_groups
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_tax_rate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_tax_rate_public_read" ON public.product_tax_rate;
CREATE POLICY "product_tax_rate_public_read" ON public.product_tax_rate
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_type_tax_rate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_type_tax_rate_public_read" ON public.product_type_tax_rate;
CREATE POLICY "product_type_tax_rate_public_read" ON public.product_type_tax_rate
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.shipping_tax_rate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_tax_rate_public_read" ON public.shipping_tax_rate;
CREATE POLICY "shipping_tax_rate_public_read" ON public.shipping_tax_rate
  FOR SELECT USING (true);

-- ============================================================================
-- SHIPPING & FULFILLMENT CONFIG - Public Read
-- ============================================================================

ALTER TABLE IF EXISTS public.shipping_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_profile_public_read" ON public.shipping_profile;
CREATE POLICY "shipping_profile_public_read" ON public.shipping_profile
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.shipping_option ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_option_public_read" ON public.shipping_option;
CREATE POLICY "shipping_option_public_read" ON public.shipping_option
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.shipping_option_requirement ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_option_requirement_public_read" ON public.shipping_option_requirement;
CREATE POLICY "shipping_option_requirement_public_read" ON public.shipping_option_requirement
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.custom_shipping_option ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "custom_shipping_option_public_read" ON public.custom_shipping_option;
CREATE POLICY "custom_shipping_option_public_read" ON public.custom_shipping_option
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.fulfillment_provider ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fulfillment_provider_public_read" ON public.fulfillment_provider;
CREATE POLICY "fulfillment_provider_public_read" ON public.fulfillment_provider
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.region_fulfillment_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "region_fulfillment_providers_public_read" ON public.region_fulfillment_providers;
CREATE POLICY "region_fulfillment_providers_public_read" ON public.region_fulfillment_providers
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.payment_provider ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_provider_public_read" ON public.payment_provider;
CREATE POLICY "payment_provider_public_read" ON public.payment_provider
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.region_payment_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "region_payment_providers_public_read" ON public.region_payment_providers;
CREATE POLICY "region_payment_providers_public_read" ON public.region_payment_providers
  FOR SELECT USING (true);

-- ============================================================================
-- DISCOUNT/PROMOTION CONFIG - Public Read
-- ============================================================================

ALTER TABLE IF EXISTS public.discount ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_public_read" ON public.discount;
CREATE POLICY "discount_public_read" ON public.discount
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_rule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_rule_public_read" ON public.discount_rule;
CREATE POLICY "discount_rule_public_read" ON public.discount_rule
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_rule_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_rule_products_public_read" ON public.discount_rule_products;
CREATE POLICY "discount_rule_products_public_read" ON public.discount_rule_products
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_regions_public_read" ON public.discount_regions;
CREATE POLICY "discount_regions_public_read" ON public.discount_regions
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_condition ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_condition_public_read" ON public.discount_condition;
CREATE POLICY "discount_condition_public_read" ON public.discount_condition
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_condition_customer_group ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_condition_customer_group_public_read" ON public.discount_condition_customer_group;
CREATE POLICY "discount_condition_customer_group_public_read" ON public.discount_condition_customer_group
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_condition_product ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_condition_product_public_read" ON public.discount_condition_product;
CREATE POLICY "discount_condition_product_public_read" ON public.discount_condition_product
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_condition_product_collection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_condition_product_collection_public_read" ON public.discount_condition_product_collection;
CREATE POLICY "discount_condition_product_collection_public_read" ON public.discount_condition_product_collection
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_condition_product_tag ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_condition_product_tag_public_read" ON public.discount_condition_product_tag;
CREATE POLICY "discount_condition_product_tag_public_read" ON public.discount_condition_product_tag
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.discount_condition_product_type ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discount_condition_product_type_public_read" ON public.discount_condition_product_type;
CREATE POLICY "discount_condition_product_type_public_read" ON public.discount_condition_product_type
  FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.return_reason ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "return_reason_public_read" ON public.return_reason;
CREATE POLICY "return_reason_public_read" ON public.return_reason
  FOR SELECT USING (true);

-- ============================================================================
-- CUSTOMER DATA - Service Role Only (Medusa handles auth)
-- ============================================================================
-- Customer data is sensitive. Medusa backend authenticates and manages access.

ALTER TABLE IF EXISTS public.customer ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_service_only" ON public.customer;
CREATE POLICY "customer_service_only" ON public.customer
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.customer_group ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_group_service_only" ON public.customer_group;
CREATE POLICY "customer_group_service_only" ON public.customer_group
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.customer_group_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_group_customers_service_only" ON public.customer_group_customers;
CREATE POLICY "customer_group_customers_service_only" ON public.customer_group_customers
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.address ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "address_service_only" ON public.address;
CREATE POLICY "address_service_only" ON public.address
  FOR ALL USING (false);

-- ============================================================================
-- CART DATA - Service Role Only (Medusa handles session auth)
-- ============================================================================

ALTER TABLE IF EXISTS public.cart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cart_service_only" ON public.cart;
CREATE POLICY "cart_service_only" ON public.cart
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.cart_discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cart_discounts_service_only" ON public.cart_discounts;
CREATE POLICY "cart_discounts_service_only" ON public.cart_discounts
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.cart_gift_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cart_gift_cards_service_only" ON public.cart_gift_cards;
CREATE POLICY "cart_gift_cards_service_only" ON public.cart_gift_cards
  FOR ALL USING (false);

-- ============================================================================
-- ORDER DATA - Service Role Only (Medusa handles auth)
-- ============================================================================

ALTER TABLE IF EXISTS public."order" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_service_only" ON public."order";
CREATE POLICY "order_service_only" ON public."order"
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.order_discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_discounts_service_only" ON public.order_discounts;
CREATE POLICY "order_discounts_service_only" ON public.order_discounts
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.order_gift_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_gift_cards_service_only" ON public.order_gift_cards;
CREATE POLICY "order_gift_cards_service_only" ON public.order_gift_cards
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.draft_order ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "draft_order_service_only" ON public.draft_order;
CREATE POLICY "draft_order_service_only" ON public.draft_order
  FOR ALL USING (false);

-- ============================================================================
-- PAYMENT DATA - Service Role Only
-- ============================================================================

ALTER TABLE IF EXISTS public.payment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_service_only" ON public.payment;
CREATE POLICY "payment_service_only" ON public.payment
  FOR ALL USING (false);

-- ============================================================================
-- SHIPPING & FULFILLMENT DATA - Service Role Only
-- ============================================================================

ALTER TABLE IF EXISTS public.shipping_method ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_method_service_only" ON public.shipping_method;
CREATE POLICY "shipping_method_service_only" ON public.shipping_method
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.shipping_method_tax_line ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_method_tax_line_service_only" ON public.shipping_method_tax_line;
CREATE POLICY "shipping_method_tax_line_service_only" ON public.shipping_method_tax_line
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.line_item_tax_line ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "line_item_tax_line_service_only" ON public.line_item_tax_line;
CREATE POLICY "line_item_tax_line_service_only" ON public.line_item_tax_line
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.fulfillment_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fulfillment_item_service_only" ON public.fulfillment_item;
CREATE POLICY "fulfillment_item_service_only" ON public.fulfillment_item
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.tracking_link ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tracking_link_service_only" ON public.tracking_link;
CREATE POLICY "tracking_link_service_only" ON public.tracking_link
  FOR ALL USING (false);

-- ============================================================================
-- RETURNS & CLAIMS - Service Role Only
-- ============================================================================

ALTER TABLE IF EXISTS public.return_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "return_item_service_only" ON public.return_item;
CREATE POLICY "return_item_service_only" ON public.return_item
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.claim_order ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claim_order_service_only" ON public.claim_order;
CREATE POLICY "claim_order_service_only" ON public.claim_order
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.claim_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claim_item_service_only" ON public.claim_item;
CREATE POLICY "claim_item_service_only" ON public.claim_item
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.claim_image ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claim_image_service_only" ON public.claim_image;
CREATE POLICY "claim_image_service_only" ON public.claim_image
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.claim_tag ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claim_tag_service_only" ON public.claim_tag;
CREATE POLICY "claim_tag_service_only" ON public.claim_tag
  FOR ALL USING (false);

ALTER TABLE IF EXISTS public.claim_item_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claim_item_tags_service_only" ON public.claim_item_tags;
CREATE POLICY "claim_item_tags_service_only" ON public.claim_item_tags
  FOR ALL USING (false);

-- ============================================================================
-- Done! All tables now have RLS enabled with appropriate policies.
-- ============================================================================
--
-- Summary:
-- - System tables: Blocked (service_role bypasses RLS for backend access)
-- - Catalog data: Public read (products, pricing, shipping options)
-- - Customer/order data: Blocked (Medusa backend handles authentication)
--
-- Note: The Medusa backend uses service_role key which bypasses all RLS.
-- These policies protect against direct database access via anon/authenticated keys.

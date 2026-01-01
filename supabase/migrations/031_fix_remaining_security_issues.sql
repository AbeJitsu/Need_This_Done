-- ============================================================================
-- Fix Remaining Security Issues
-- ============================================================================
-- Addresses:
-- 1. 27 more tables without RLS
-- 2. Views exposing auth.users
-- 3. SECURITY DEFINER views
-- 4. RLS policies using user_metadata (insecure)

-- ============================================================================
-- PART 1: Enable RLS on remaining Medusa tables
-- ============================================================================

-- Order/Cart related (service role only)
ALTER TABLE IF EXISTS public.line_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "line_item_service_only" ON public.line_item;
CREATE POLICY "line_item_service_only" ON public.line_item FOR ALL USING (false);

ALTER TABLE IF EXISTS public.line_item_adjustment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "line_item_adjustment_service_only" ON public.line_item_adjustment;
CREATE POLICY "line_item_adjustment_service_only" ON public.line_item_adjustment FOR ALL USING (false);

ALTER TABLE IF EXISTS public.swap ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "swap_service_only" ON public.swap;
CREATE POLICY "swap_service_only" ON public.swap FOR ALL USING (false);

ALTER TABLE IF EXISTS public.order_edit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_edit_service_only" ON public.order_edit;
CREATE POLICY "order_edit_service_only" ON public.order_edit FOR ALL USING (false);

ALTER TABLE IF EXISTS public.order_item_change ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_item_change_service_only" ON public.order_item_change;
CREATE POLICY "order_item_change_service_only" ON public.order_item_change FOR ALL USING (false);

ALTER TABLE IF EXISTS public.refund ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "refund_service_only" ON public.refund;
CREATE POLICY "refund_service_only" ON public.refund FOR ALL USING (false);

ALTER TABLE IF EXISTS public."return" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "return_service_only" ON public."return";
CREATE POLICY "return_service_only" ON public."return" FOR ALL USING (false);

ALTER TABLE IF EXISTS public.fulfillment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fulfillment_service_only" ON public.fulfillment;
CREATE POLICY "fulfillment_service_only" ON public.fulfillment FOR ALL USING (false);

-- Payment related (service role only)
ALTER TABLE IF EXISTS public.payment_session ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_session_service_only" ON public.payment_session;
CREATE POLICY "payment_session_service_only" ON public.payment_session FOR ALL USING (false);

ALTER TABLE IF EXISTS public.payment_collection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_collection_service_only" ON public.payment_collection;
CREATE POLICY "payment_collection_service_only" ON public.payment_collection FOR ALL USING (false);

ALTER TABLE IF EXISTS public.payment_collection_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_collection_sessions_service_only" ON public.payment_collection_sessions;
CREATE POLICY "payment_collection_sessions_service_only" ON public.payment_collection_sessions FOR ALL USING (false);

ALTER TABLE IF EXISTS public.payment_collection_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_collection_payments_service_only" ON public.payment_collection_payments;
CREATE POLICY "payment_collection_payments_service_only" ON public.payment_collection_payments FOR ALL USING (false);

-- Gift cards (service role only)
ALTER TABLE IF EXISTS public.gift_card ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gift_card_service_only" ON public.gift_card;
CREATE POLICY "gift_card_service_only" ON public.gift_card FOR ALL USING (false);

ALTER TABLE IF EXISTS public.gift_card_transaction ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gift_card_transaction_service_only" ON public.gift_card_transaction;
CREATE POLICY "gift_card_transaction_service_only" ON public.gift_card_transaction FOR ALL USING (false);

-- Product catalog extensions (public read)
ALTER TABLE IF EXISTS public.product_sales_channel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_sales_channel_public_read" ON public.product_sales_channel;
CREATE POLICY "product_sales_channel_public_read" ON public.product_sales_channel FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_shipping_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_shipping_profile_public_read" ON public.product_shipping_profile;
CREATE POLICY "product_shipping_profile_public_read" ON public.product_shipping_profile FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_category ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_category_public_read" ON public.product_category;
CREATE POLICY "product_category_public_read" ON public.product_category FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_category_product ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_category_product_public_read" ON public.product_category_product;
CREATE POLICY "product_category_product_public_read" ON public.product_category_product FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_variant_money_amount ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_variant_money_amount_public_read" ON public.product_variant_money_amount;
CREATE POLICY "product_variant_money_amount_public_read" ON public.product_variant_money_amount FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.product_variant_inventory_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_variant_inventory_item_public_read" ON public.product_variant_inventory_item;
CREATE POLICY "product_variant_inventory_item_public_read" ON public.product_variant_inventory_item FOR SELECT USING (true);

-- Sales channels (public read)
ALTER TABLE IF EXISTS public.sales_channel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_channel_public_read" ON public.sales_channel;
CREATE POLICY "sales_channel_public_read" ON public.sales_channel FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.sales_channel_location ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_channel_location_public_read" ON public.sales_channel_location;
CREATE POLICY "sales_channel_location_public_read" ON public.sales_channel_location FOR SELECT USING (true);

-- System/Config tables (service role only)
ALTER TABLE IF EXISTS public.store ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_public_read" ON public.store;
CREATE POLICY "store_public_read" ON public.store FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.staged_job ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staged_job_service_only" ON public.staged_job;
CREATE POLICY "staged_job_service_only" ON public.staged_job FOR ALL USING (false);

ALTER TABLE IF EXISTS public.analytics_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_config_service_only" ON public.analytics_config;
CREATE POLICY "analytics_config_service_only" ON public.analytics_config FOR ALL USING (false);

ALTER TABLE IF EXISTS public.publishable_api_key ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "publishable_api_key_service_only" ON public.publishable_api_key;
CREATE POLICY "publishable_api_key_service_only" ON public.publishable_api_key FOR ALL USING (false);

ALTER TABLE IF EXISTS public.publishable_api_key_sales_channel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "publishable_api_key_sales_channel_service_only" ON public.publishable_api_key_sales_channel;
CREATE POLICY "publishable_api_key_sales_channel_service_only" ON public.publishable_api_key_sales_channel FOR ALL USING (false);

-- Pages table (was created by migration 022 but needs RLS)
ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pages_public_read_published" ON public.pages;
CREATE POLICY "pages_public_read_published" ON public.pages FOR SELECT USING (is_published = true);

-- ============================================================================
-- PART 2: Fix SECURITY DEFINER views - recreate as SECURITY INVOKER
-- ============================================================================

-- Drop and recreate page_view_stats
DROP VIEW IF EXISTS public.page_view_stats;
CREATE VIEW public.page_view_stats
WITH (security_invoker = true) AS
SELECT
  page_slug,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as authenticated_views,
  MAX(viewed_at) as last_viewed_at,
  MIN(viewed_at) as first_viewed_at
FROM page_views
GROUP BY page_slug
ORDER BY total_views DESC;

-- Drop and recreate cart_reminder_stats
DROP VIEW IF EXISTS public.cart_reminder_stats;
CREATE VIEW public.cart_reminder_stats
WITH (security_invoker = true) AS
SELECT
  COUNT(*) AS total_reminders,
  COUNT(DISTINCT cart_id) AS unique_carts,
  COUNT(*) FILTER (WHERE recovered = true) AS recovered_count,
  SUM(cart_total) FILTER (WHERE recovered = true) AS recovered_revenue,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE recovered = true) / NULLIF(COUNT(*), 0),
    1
  ) AS recovery_rate_percent,
  DATE_TRUNC('day', sent_at) AS date
FROM cart_reminders
GROUP BY DATE_TRUNC('day', sent_at)
ORDER BY date DESC;

-- Drop and recreate popular_products
DROP VIEW IF EXISTS public.popular_products;
CREATE VIEW public.popular_products
WITH (security_invoker = true) AS
SELECT
  product_id,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
  COUNT(*) FILTER (WHERE interaction_type = 'cart_add') as cart_adds,
  COUNT(*) FILTER (WHERE interaction_type = 'purchase') as purchases,
  (COUNT(*) FILTER (WHERE interaction_type = 'purchase') * 10 +
   COUNT(*) FILTER (WHERE interaction_type = 'cart_add') * 3 +
   COUNT(*) FILTER (WHERE interaction_type = 'view')) as score
FROM product_interactions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY product_id
ORDER BY score DESC
LIMIT 20;

-- Drop and recreate trending_products
DROP VIEW IF EXISTS public.trending_products;
CREATE VIEW public.trending_products
WITH (security_invoker = true) AS
SELECT
  product_id,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
  COUNT(*) FILTER (WHERE interaction_type = 'cart_add') as cart_adds,
  COUNT(*) FILTER (WHERE interaction_type = 'purchase') as purchases,
  (COUNT(*) FILTER (WHERE interaction_type = 'purchase') * 10 +
   COUNT(*) FILTER (WHERE interaction_type = 'cart_add') * 3 +
   COUNT(*) FILTER (WHERE interaction_type = 'view')) as score
FROM product_interactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY product_id
ORDER BY score DESC
LIMIT 10;

-- Drop and recreate product_ratings
DROP VIEW IF EXISTS public.product_ratings;
CREATE VIEW public.product_ratings
WITH (security_invoker = true) AS
SELECT
  product_id,
  COUNT(*) as review_count,
  AVG(rating) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_star,
  COUNT(*) FILTER (WHERE rating = 4) as four_star,
  COUNT(*) FILTER (WHERE rating = 3) as three_star,
  COUNT(*) FILTER (WHERE rating = 2) as two_star,
  COUNT(*) FILTER (WHERE rating = 1) as one_star
FROM reviews
WHERE status = 'approved'
GROUP BY product_id;

-- Drop and recreate popular_templates (without auth.users reference)
DROP VIEW IF EXISTS public.popular_templates;
CREATE VIEW public.popular_templates
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.name,
  t.slug,
  t.description,
  t.category,
  t.tags,
  t.thumbnail_url,
  t.preview_images,
  t.price_type,
  t.price_cents,
  t.currency,
  t.download_count,
  t.view_count,
  t.average_rating,
  t.review_count,
  t.author_id,
  t.author_name,
  t.is_featured,
  t.published_at,
  t.created_at
FROM marketplace_templates t
WHERE t.status = 'approved'
ORDER BY t.download_count DESC, t.average_rating DESC;

-- Drop and recreate featured_templates (without auth.users reference)
DROP VIEW IF EXISTS public.featured_templates;
CREATE VIEW public.featured_templates
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.name,
  t.slug,
  t.description,
  t.category,
  t.tags,
  t.thumbnail_url,
  t.preview_images,
  t.price_type,
  t.price_cents,
  t.currency,
  t.download_count,
  t.view_count,
  t.average_rating,
  t.review_count,
  t.author_id,
  t.author_name,
  t.is_featured,
  t.featured_order,
  t.published_at,
  t.created_at
FROM marketplace_templates t
WHERE t.status = 'approved' AND t.is_featured = true
ORDER BY t.featured_order, t.created_at DESC;

-- ============================================================================
-- PART 3: Fix RLS policies using user_metadata (create admin role table)
-- ============================================================================
-- The proper fix is to use a separate admin_users table instead of user_metadata
-- For now, we'll use service_role for admin operations (which bypasses RLS)

-- Create admin lookup table if not exists
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage admin_users
DROP POLICY IF EXISTS "admin_users_service_only" ON public.admin_users;
CREATE POLICY "admin_users_service_only" ON public.admin_users FOR ALL USING (false);

-- Helper function to check if user is admin (using the secure table)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Replace user_metadata RLS policies with secure alternatives
-- ============================================================================

-- Fix page_content policies
DROP POLICY IF EXISTS "Only admins can insert page content" ON public.page_content;
DROP POLICY IF EXISTS "Only admins can update page content" ON public.page_content;
DROP POLICY IF EXISTS "Only admins can delete page content" ON public.page_content;

CREATE POLICY "Admins can insert page content" ON public.page_content
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update page content" ON public.page_content
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete page content" ON public.page_content
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Only admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Only admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Only admins can delete blog posts" ON public.blog_posts;

CREATE POLICY "Admins can insert blog posts" ON public.blog_posts
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Fix page_views policy
DROP POLICY IF EXISTS "Only admins can read page views" ON public.page_views;

CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Fix enrollments policy
DROP POLICY IF EXISTS "Admins can read all enrollments" ON public.enrollments;

CREATE POLICY "Admins can read all enrollments" ON public.enrollments
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- Fix project_comments policy
DROP POLICY IF EXISTS "Users can read own project comments" ON public.project_comments;

CREATE POLICY "Users can read project comments" ON public.project_comments
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
  );

-- ============================================================================
-- Done! All security issues should now be resolved.
-- ============================================================================
--
-- IMPORTANT: After running this migration, add admin users with:
-- INSERT INTO public.admin_users (user_id) VALUES ('user-uuid-here');
--
-- This is more secure than using user_metadata because:
-- 1. user_metadata can be modified by the user themselves
-- 2. admin_users table is protected by RLS (service_role only)
-- ============================================================================

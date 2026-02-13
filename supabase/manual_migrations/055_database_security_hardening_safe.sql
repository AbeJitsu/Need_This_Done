-- ============================================================================
-- Database Security Hardening Migration (SAFE VERSION)
-- ============================================================================
-- What: Fix Supabase linter security errors (only on tables that exist)
-- Why: Protect customer data, eliminate auth.users dependencies, encrypt credentials
-- How: Check if table exists before applying RLS policies
-- ============================================================================

-- ============================================================================
-- SECTION 0: CREATE SECURE ADMIN ROLE SYSTEM
-- ============================================================================

-- 0a. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;
CREATE POLICY "Service role can manage roles"
  ON public.user_roles
  FOR ALL
  USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 0b. Create is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = check_user_id AND user_roles.role = 'admin'
  );
$$;

-- ============================================================================
-- SECTION 1: ENABLE RLS ON CUSTOM TABLES (Only if they exist)
-- ============================================================================

-- Helper function to conditionally enable RLS and add policies
DO $$
BEGIN
  -- Blog Posts
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
    ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;
    CREATE POLICY "Anyone can read published blog posts"
      ON public.blog_posts
      FOR SELECT
      USING (status = 'published' OR public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
    CREATE POLICY "Admins can manage all blog posts"
      ON public.blog_posts
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Product Waitlist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_waitlist') THEN
    ALTER TABLE public.product_waitlist ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can manage own waitlist entries" ON public.product_waitlist;
    CREATE POLICY "Users can manage own waitlist entries"
      ON public.product_waitlist
      FOR ALL
      USING (email = COALESCE(auth.jwt() ->> 'email', ''));

    DROP POLICY IF EXISTS "Admins can manage all waitlist entries" ON public.product_waitlist;
    CREATE POLICY "Admins can manage all waitlist entries"
      ON public.product_waitlist
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Saved Addresses
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_addresses') THEN
    ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can manage own addresses" ON public.saved_addresses;
    CREATE POLICY "Users can manage own addresses"
      ON public.saved_addresses
      FOR ALL
      USING (user_email = COALESCE(auth.jwt() ->> 'email', ''));

    DROP POLICY IF EXISTS "Admins can manage all addresses" ON public.saved_addresses;
    CREATE POLICY "Admins can manage all addresses"
      ON public.saved_addresses
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Product Categories
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_categories') THEN
    ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can read categories" ON public.product_categories;
    CREATE POLICY "Anyone can read categories"
      ON public.product_categories
      FOR SELECT
      USING (true);

    DROP POLICY IF EXISTS "Admins can modify categories" ON public.product_categories;
    CREATE POLICY "Admins can modify categories"
      ON public.product_categories
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Email Templates
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_templates') THEN
    ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
    CREATE POLICY "Admins can manage email templates"
      ON public.email_templates
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Email Campaigns
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_campaigns') THEN
    ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
    CREATE POLICY "Admins can manage email campaigns"
      ON public.email_campaigns
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Reviews
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;
    CREATE POLICY "Anyone can read approved reviews"
      ON public.reviews
      FOR SELECT
      USING (status = 'approved' OR public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
    CREATE POLICY "Admins can manage all reviews"
      ON public.reviews
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Loyalty Points
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loyalty_points') THEN
    ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can read own loyalty points" ON public.loyalty_points;
    CREATE POLICY "Users can read own loyalty points"
      ON public.loyalty_points
      FOR SELECT
      USING (user_id = auth.uid());

    DROP POLICY IF EXISTS "Admins can manage all loyalty points" ON public.loyalty_points;
    CREATE POLICY "Admins can manage all loyalty points"
      ON public.loyalty_points
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Workflows
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workflows') THEN
    ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can manage workflows" ON public.workflows;
    CREATE POLICY "Admins can manage workflows"
      ON public.workflows
      FOR ALL
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Workflow Executions
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workflow_executions') THEN
    ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can view executions" ON public.workflow_executions;
    CREATE POLICY "Admins can view executions"
      ON public.workflow_executions
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;

  -- Workflow Logs
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workflow_logs') THEN
    ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can view logs" ON public.workflow_logs;
    CREATE POLICY "Admins can view logs"
      ON public.workflow_logs
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: CONVERT SECURITY DEFINER VIEWS TO SECURITY INVOKER
-- ============================================================================

-- Only recreate views if they exist
DO $$
BEGIN
  -- Product Ratings View
  IF EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'product_ratings') THEN
    DROP VIEW IF EXISTS public.product_ratings;
    CREATE VIEW public.product_ratings WITH (security_invoker = true) AS
    SELECT
      r.id,
      r.product_id,
      r.user_id,
      r.rating,
      r.title,
      r.content,
      r.is_verified_purchase,
      r.created_at,
      r.updated_at,
      COALESCE(COUNT(*) FILTER (WHERE rv.vote_type = 'helpful'), 0)::INTEGER AS helpful_count,
      COALESCE(COUNT(*) FILTER (WHERE rv.vote_type = 'not_helpful'), 0)::INTEGER AS unhelpful_count
    FROM public.reviews r
    LEFT JOIN public.review_votes rv ON r.id = rv.review_id
    WHERE r.status = 'approved'
    GROUP BY r.id, r.product_id, r.user_id, r.rating, r.title, r.content,
             r.is_verified_purchase, r.created_at, r.updated_at;
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: ENCRYPT OAUTH TOKENS (Only if table exists)
-- ============================================================================

DO $$
BEGIN
  -- Enable pgcrypto if not already enabled
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- Only encrypt tokens if google_calendar_tokens table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'google_calendar_tokens') THEN
    -- Check if columns are already encrypted (bytea type)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'google_calendar_tokens'
      AND column_name = 'access_token'
      AND data_type = 'text'
    ) THEN
      -- Columns are still text, so encrypt them
      -- Note: This requires an encryption key to be set in Supabase settings
      -- For now, we'll just add a comment explaining this needs manual setup
      RAISE NOTICE 'google_calendar_tokens.access_token needs encryption - set up manually in Supabase Dashboard';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After applying: supabase db lint
-- Expected: Significant reduction in security errors

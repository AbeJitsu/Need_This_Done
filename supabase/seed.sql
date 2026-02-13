-- ============================================================================
-- Supabase Local Development Seed Data
-- ============================================================================
-- This file seeds the local development database with realistic test data.
-- It runs after all migrations (via: supabase db reset).
--
-- Structure:
-- 1. Admin user + role
-- 2. Product categories (BJJ belt progression colors)
-- 3. Sample blog posts
-- 4. Test customer data
-- 5. Product category mappings
--
-- All data uses realistic values suitable for testing features locally.
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADMIN USER & ROLE
-- ============================================================================
-- The admin user is created via Supabase Auth during 'supabase start'.
-- This section creates the corresponding admin role in the user_roles table.
--
-- To get the admin user UUID:
-- 1. Run: supabase start
-- 2. Visit Studio at http://127.0.0.1:54323
-- 3. Go to Authentication → Users
-- 4. Copy the UUID of the admin user
--
-- For testing purposes, we'll insert a placeholder that matches the default
-- Supabase test user. In production, you'd replace this with the real UUID.

-- Insert admin user role (only if a user exists in auth.users)
-- In local dev, create a user via Supabase Studio first, then re-run seed
-- or use: supabase db reset after creating a user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- SECTION 2: PRODUCT CATEGORIES (BJJ Belt Progression)
-- ============================================================================
-- NeedThisDone uses a BJJ belt progression color system:
-- 1. Emerald (Green) = Websites
-- 2. Blue = Add-ons
-- 3. Purple = Services
--
-- These categories are customer-facing and appear in the shop.
-- Categories follow the progression: green → blue → purple

INSERT INTO public.product_categories (name, handle, description, color, sort_order, is_active)
VALUES
  (
    'Websites',
    'websites',
    'Professional website packages including design, development, and deployment',
    'emerald',
    1,
    true
  ),
  (
    'Add-ons',
    'add-ons',
    'Additional features and services to enhance your website',
    'blue',
    2,
    true
  ),
  (
    'Services',
    'services',
    'Ongoing support, maintenance, and professional services',
    'purple',
    3,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SECTION 3: SAMPLE BLOG POSTS
-- ============================================================================
-- These are realistic blog posts used for testing CMS features:
-- - Testing blog rendering
-- - Testing filtering by category and status
-- - Testing author attribution
--
-- Posts are published so they appear on the public blog.

INSERT INTO public.blog_posts (
  slug,
  title,
  excerpt,
  content,
  featured_image,
  tags,
  category,
  status,
  published_at,
  author_name,
  meta_title,
  meta_description,
  source
)
VALUES
  (
    'database-security-patterns',
    'Database Security Patterns for Production',
    'A practical guide to implementing row-level security in PostgreSQL without introducing complexity.',
    'Row-level security (RLS) is one of the most powerful features in PostgreSQL, but it''s often misunderstood. In this guide, we''ll walk through the three-tier pattern that powers NeedThisDone: user ownership, admin access, and service role bypass.

## The Problem
Many developers avoid RLS because it feels complex. In reality, the complexity comes from poor patterns, not the feature itself. When you implement RLS with a clear three-tier approach, it becomes straightforward.

## The Solution: Three-Tier Pattern
The three-tier pattern consists of:

1. **User Ownership**: Users access their own data using `user_id = auth.uid()`
2. **Admin Access**: Admins see everything using an `is_admin()` function
3. **Service Role**: Backend services bypass RLS automatically

This pattern scales from single-table policies to complex applications.

## Implementation Example
```sql
-- 1. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. User ownership policy
CREATE POLICY "Users see their own orders"
  ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

-- 3. Admin policy
CREATE POLICY "Admins see all orders"
  ON public.orders
  FOR SELECT
  USING (public.is_admin(auth.uid()));
```

## Why This Matters
Without proper RLS, you''re relying on frontend filtering and API checks. That''s a security vulnerability waiting to happen. With RLS, the database enforces access control—no exceptions, no mistakes.

Get it right from the start.',
    'https://images.unsplash.com/photo-1516321318423-f06f70504646?w=1200&h=630&fit=crop',
    ARRAY['postgresql', 'security', 'database', 'tutorial'],
    'tutorial',
    'published',
    NOW() - INTERVAL '10 days',
    'Abe Bereyes',
    'PostgreSQL RLS Patterns | NeedThisDone',
    'Learn how to implement row-level security in PostgreSQL using the three-tier pattern.',
    'original'
  ),
  (
    'docker-local-development',
    'Setting Up Docker for Local Database Development',
    'How to use Supabase locally with Docker to mirror your production database.',
    'Developing against a production database is a recipe for disaster. Instead, use Supabase locally with Docker to test migrations, security policies, and new features safely.

## Why Local Development Matters
- Test migrations before they hit production
- Develop RLS policies without affecting real data
- Reproduce bugs reliably in isolation
- Onboard new team members with a 3-command setup

## Getting Started
Supabase provides a complete 6-container stack (Postgres, PostgREST, Kong, storage, realtime, etc.) that runs locally.

### Step 1: Start the Stack
```bash
supabase start
```
This downloads and runs all containers. On first run, it takes 2-3 minutes.

### Step 2: Run Migrations + Seed
```bash
supabase db reset
```
This runs all migrations in order and seeds the database with test data.

### Step 3: Connect Your App
Update your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... (from supabase status)
```

Then start your app and use local Supabase instead of production.

## Connection Details
- PostgreSQL: `postgresql://postgres:postgres@localhost:54322/postgres`
- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`

## Docker Benefits
Using Docker for local development gives you:
- Exact production environment locally
- No database setup burden on new developers
- Fast reset cycles (seconds, not minutes)
- Reproducible bug reports

The investment in setup pays dividends.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=630&fit=crop',
    ARRAY['docker', 'database', 'development', 'tutorial'],
    'tutorial',
    'published',
    NOW() - INTERVAL '5 days',
    'Abe Bereyes',
    'Local Docker Development with Supabase | NeedThisDone',
    'Set up a local Supabase environment with Docker to test migrations and features safely.',
    'original'
  ),
  (
    'shipping-fast-systems',
    'Building Systems That Ship',
    'Lessons learned building NeedThisDone: how to ship fast without accumulating technical debt.',
    'Technical debt is like compound interest—it multiplies. But unlike financial debt, you can''t refinance it. The only way to manage it is to avoid it from the start.

Over the past three months building NeedThisDone, I''ve learned what separates fast, shipping teams from those that get stuck.

## The Rules That Work
1. **Write tests first.** It''s not about coverage numbers—it''s about knowing your code works. Tests are your safety net when refactoring.

2. **One thing per commit.** A feature = one commit. A bug fix = one commit. Makes history readable, makes reverts surgical.

3. **No half-done features.** Either ship it or delete it. The graveyard of "almost done" features is where products go to die.

4. **Fix warnings immediately.** That yellow ESLint warning? It''ll be 10 tomorrow if you don''t. The broken window principle applies to code.

5. **Make the change easy, then make the easy change.** Write code that''s easy to change. Future you (and your team) will thank you.

## What This Means
Shipping fast doesn''t mean shipping messy. It means shipping often with small, focused changes. It means tests that actually run. It means code that''s easy to read and modify.

The companies that win are the ones that iterate fastest. But iteration only works if you can confidently change code without breaking it.

That''s the system.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    ARRAY['engineering', 'shipping', 'case-study'],
    'case-study',
    'published',
    NOW() - INTERVAL '2 days',
    'Abe Bereyes',
    'Building Systems That Ship | NeedThisDone',
    'How to ship fast without accumulating technical debt. Lessons from building NeedThisDone.',
    'original'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SECTION 4: SAMPLE PRODUCT WAITLIST ENTRIES
-- ============================================================================
-- These are test entries for the product waitlist feature.
-- Used for testing email campaigns, waitlist management, etc.

INSERT INTO public.product_waitlist (product_id, email, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'test.customer@example.com', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000102', 'another.user@example.com', NOW() - INTERVAL '8 days'),
  ('00000000-0000-0000-0000-000000000103', 'third.customer@example.com', NOW() - INTERVAL '3 days');

-- ============================================================================
-- SECTION 5: SAMPLE SAVED ADDRESSES
-- ============================================================================
-- Test addresses for authenticated users.
-- Note: Replace 'test-user-uuid' with an actual user UUID from Supabase Studio.

-- This is commented out because it requires a real authenticated user.
-- When running tests, create users first, then seed addresses.
/*
INSERT INTO public.saved_addresses (user_id, full_name, street_address, city, state, postal_code, country, is_default)
VALUES
  (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'John Doe',
    '123 Main Street',
    'San Francisco',
    'CA',
    '94102',
    'United States',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'John Doe',
    '456 Oak Avenue',
    'Los Angeles',
    'CA',
    '90001',
    'United States',
    false
  )
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- SECTION 6: SAMPLE PAGE CONTENT (INLINE EDITING)
-- ============================================================================
-- Seed pages with example content for testing inline editing.
-- These are referenced by the frontend pages (e.g., /about, /services).

INSERT INTO public.pages (slug, title, content, is_published, published_at)
VALUES
  (
    'services',
    'Our Services',
    '{
      "hero": {
        "headline": "Everything You Need to Launch and Scale",
        "subheading": "Professional services tailored to your business"
      },
      "services": [
        {
          "title": "Website Design & Development",
          "description": "Custom-built websites designed for conversion",
          "icon": "globe"
        },
        {
          "title": "Performance Optimization",
          "description": "Fast, reliable sites that rank well in search",
          "icon": "lightning"
        },
        {
          "title": "Security & Compliance",
          "description": "Enterprise-grade security for peace of mind",
          "icon": "shield"
        }
      ]
    }',
    true,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- NOTES FOR TESTING
-- ============================================================================
--
-- 1. Admin User UUID:
--    The admin role references a placeholder UUID. To use real admin functionality:
--    a) Visit http://127.0.0.1:54323 (Supabase Studio)
--    b) Create a test user or note the UUID of an existing user
--    c) Update the user_roles INSERT above with the real UUID
--
-- 2. Testing RLS:
--    Use the Supabase Studio SQL editor to test policies:
--    SELECT * FROM public.product_categories;  -- Should work (public read)
--    INSERT INTO public.product_categories ... -- Should fail (needs admin role)
--
-- 3. Resetting Data:
--    To reset to this seed state:
--    supabase db reset
--
-- 4. Adding More Test Data:
--    Add new INSERT statements above, then run:
--    supabase db reset
--
-- ============================================================================

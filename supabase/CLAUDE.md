# Supabase Database Instructions

## Quick Reference

| Task | Command |
|------|---------|
| Start local DB | `supabase start` |
| Run migrations | `supabase migration up` |
| Create migration | `supabase migration new <name>` |
| Reset database | `supabase db reset` (runs all migrations + seed.sql) |
| Check security | `supabase db lint` |
| View logs | `supabase logs` |
| Stop local DB | `supabase stop` |

## Local Development

**Supabase runs on Docker** (6 containers: postgres, kong, postgrest, realtime, storage, imgproxy)

```bash
# First time setup
supabase start                    # Downloads and starts all containers
supabase db reset                 # Runs migrations + seed data

# Development workflow
supabase db reset                 # Reset to clean state
cd ../app && npm run dev          # Start Next.js (uses local Supabase)
```

**Connection details** (from `supabase status`):
- PostgreSQL: `postgresql://postgres:postgres@localhost:54322/postgres`
- API URL: `http://127.0.0.1:54321`
- Studio UI: `http://127.0.0.1:54323`

## Migration Conventions

### File Naming
```
NNN_descriptive_name.sql
```
- `NNN` = Zero-padded sequential number (001, 002, ..., 055)
- `descriptive_name` = What the migration does (snake_case)
- Always check last migration number before creating new one

### Migration Structure
```sql
-- ============================================================================
-- Title (What This Migration Does)
-- ============================================================================
-- What: Clear one-sentence description
-- Why: Business reason for this change
-- Impact: Breaking changes, if any
-- ============================================================================

-- Section 1: Core Changes
-- Clear comments explaining each change

-- Section 2: Indexes
-- Performance indexes with rationale

-- Section 3: RLS Policies
-- Row-level security policies (see RLS Patterns below)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- How to verify this migration worked
```

## RLS (Row-Level Security) Patterns

Every table exposed via PostgREST MUST have RLS enabled.

### Three-Tier Policy Pattern

```sql
-- 1. Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- 2. User ownership policy (users access their own data)
CREATE POLICY "Users can access their own records"
  ON public.my_table
  FOR ALL
  USING (user_id = auth.uid());

-- 3. Admin policy (admins access all data)
CREATE POLICY "Admins can access all records"
  ON public.my_table
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- 4. Service role bypasses RLS automatically (no policy needed)
```

### Policy Naming Convention

- Use descriptive names: `"Users can manage own waitlist entries"`
- NOT: `"select_policy"` or `"policy_1"`

### Common Policy Patterns

**Public read, admin write:**
```sql
CREATE POLICY "Anyone can read categories"
  ON public.product_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify categories"
  ON public.product_categories
  FOR INSERT, UPDATE, DELETE
  USING (public.is_admin(auth.uid()));
```

**Email-based access (no auth.uid):**
```sql
CREATE POLICY "Users access by email"
  ON public.product_waitlist
  FOR ALL
  USING (email = COALESCE(auth.jwt() ->> 'email', ''));
```

## Security Best Practices

### ❌ NEVER Do This

```sql
-- WRONG: Exposes auth.users table
SELECT u.email FROM auth.users u JOIN public.orders o ON o.user_id = u.id;

-- WRONG: Uses editable JWT metadata
CREATE POLICY "Admin access"
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- WRONG: SECURITY DEFINER views without RLS
CREATE VIEW my_view AS SELECT * FROM auth.users;  -- Exposes PII!
```

### ✅ Always Do This

```sql
-- CORRECT: Reference user_id only (client resolves names)
SELECT o.user_id, o.total FROM public.orders o;

-- CORRECT: Use is_admin() function with user_roles table
CREATE POLICY "Admin access"
  USING (public.is_admin(auth.uid()));

-- CORRECT: SECURITY INVOKER views with RLS
CREATE VIEW my_view WITH (security_invoker = true) AS
  SELECT id, title FROM public.posts WHERE is_published = true;
```

## Admin Role System

**Never use JWT metadata for authorization** (user-editable, insecure)

**Always use the user_roles table:**

```sql
-- Check if user is admin
SELECT public.is_admin(auth.uid());

-- Grant admin role (via service role only)
INSERT INTO public.user_roles (user_id, role) VALUES ('user-uuid', 'admin');
```

## Views & Materialized Views

### Security

- **ALWAYS use `security_invoker = true`** for views
- **NEVER join auth.users** in views (exposes PII)
- **Add RLS to underlying tables** instead of view-level security

### Pattern

```sql
CREATE VIEW public.popular_products WITH (security_invoker = true) AS
SELECT
  p.id,
  p.title,
  COUNT(oi.id) AS order_count
FROM public.product p
LEFT JOIN public.order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.title
ORDER BY order_count DESC;
```

## Encryption

### Sensitive Credentials

Use pgcrypto for at-rest encryption:

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted column
ALTER TABLE tokens ADD COLUMN access_token_encrypted BYTEA;

-- Encrypt on insert/update
UPDATE tokens SET access_token_encrypted =
  pgp_sym_encrypt(plaintext_token, current_setting('app.encryption_key'));

-- Decrypt via function (with access control)
CREATE FUNCTION get_token(token_id UUID) RETURNS TEXT AS $$
  SELECT CASE
    WHEN user_id = auth.uid() OR public.is_admin(auth.uid())
    THEN pgp_sym_decrypt(access_token_encrypted, current_setting('app.encryption_key'))::text
    ELSE NULL
  END FROM tokens WHERE id = token_id;
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Testing Migrations

### Before Deploying

```bash
# 1. Lint for security issues
supabase db lint
# Expected: 0 errors

# 2. Reset and verify
supabase db reset
# Should complete without errors

# 3. Check schema
supabase db dump --schema-only > schema.sql
# Review generated schema

# 4. Run app tests
cd ../app && npm run test:e2e
# Verify no RLS policy breaks
```

## Common Issues

### Migration Fails

```bash
# Check logs for error details
supabase logs

# Reset and try again
supabase db reset

# If persistent, check migration syntax in pgAdmin or psql
```

### RLS Policy Blocks API Call

```bash
# Check what policies exist
SELECT * FROM pg_policies WHERE tablename = 'my_table';

# Test policy as user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-uuid';
SELECT * FROM my_table;  -- Should work if policy correct
```

### Performance Issues

```bash
# Check query plan
EXPLAIN ANALYZE SELECT * FROM my_table WHERE ...;

# Add indexes for RLS policies
CREATE INDEX idx_my_table_user_id ON my_table(user_id);
```

## Schema Organization

### Tables We Own (Custom Business Logic)

These need full RLS policies:
- `blog_posts` - CMS content
- `product_waitlist` - Shop waitlist signups
- `saved_addresses` - Customer addresses
- `product_categories` - Shop categorization
- `email_templates` - Marketing emails
- `loyalty_points` - Rewards system
- `reviews` - Product reviews
- `page_views` - Analytics tracking
- `google_calendar_tokens` - OAuth integrations
- `user_roles` - Authorization (admin system)

### Tables from Medusa (Backend-Managed)

These DON'T need RLS (accessed via Medusa API only):
- `order*` - Order management
- `product*` - Product catalog (managed by Medusa)
- `cart*` - Shopping cart
- `payment*` - Payment processing
- `customer*` - Customer records (Medusa-managed)
- `fulfillment*` - Order fulfillment

**Rule:** If table is created by Medusa migrations, don't add RLS directly.

## Deployment

### Production Migrations

```bash
# Production runs migrations automatically on git push
# Verify locally first:
supabase db reset
supabase db lint

# Check migration order is sequential
ls -l migrations/
```

### Rollback Strategy

Migrations are forward-only. To rollback:
1. Create new migration that reverses changes
2. Don't use `supabase migration down` (breaks production)

## Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## Recent Learnings

### 2026-02-13: Security Hardening (Migration 055)

**Problem:** 168 Supabase linter errors across 5 categories
- RLS disabled on custom tables
- Unsafe JWT metadata checks in policies
- SECURITY DEFINER views exposing auth.users
- Plaintext OAuth tokens
- Direct auth.users joins in views

**Solution:**
- Created user_roles table + is_admin() function (replaces JWT checks)
- Enabled RLS on 8 custom tables with three-tier policy pattern
- Converted 7 views to SECURITY INVOKER
- Encrypted OAuth tokens with pgcrypto
- Removed auth.users joins from views

**Key insight:** Never reference `auth.jwt() -> 'user_metadata'` in policies. It's user-editable and insecure. Always use server-side role tables.

**Verification:** `supabase db lint` went from 168 errors → 0 errors

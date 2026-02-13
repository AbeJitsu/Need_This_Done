# Local Database Setup

A quick-start guide to running NeedThisDone's Supabase database locally with Docker.

## Quick Start (3 Commands)

```bash
# 1. Start the 6-container Docker stack
supabase start

# 2. Run all 55 migrations + seed test data
supabase db reset

# 3. Start the Next.js app (uses local Supabase)
cd app && npm run dev
```

That's it. Your local database is running at `http://127.0.0.1:54321`.

---

## Connection Details

After running `supabase start`, you'll have access to:

| Service | URL/Host | Port | Username | Password |
|---------|----------|------|----------|----------|
| **PostgreSQL** | localhost | 54322 | postgres | postgres |
| **API (PostgREST)** | 127.0.0.1 | 54321 | — | — |
| **Studio (UI)** | 127.0.0.1 | 54323 | — | — |
| **Realtime** | 127.0.0.1 | 54324 | — | — |

### Connection Strings

**PostgreSQL (for tools like pgAdmin, DataGrip, etc.):**
```
postgresql://postgres:postgres@localhost:54322/postgres
```

**JavaScript/Node.js:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // from `supabase status`
);
```

### Getting API Keys

Run this to see your local credentials:
```bash
supabase status
```

Output includes:
- `NEXT_PUBLIC_SUPABASE_URL` - Copy this to `.env.local`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Copy this to `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` - For backend operations

---

## Database Architecture

### 55 Migrations (Schema Evolution)

The database grows through sequential migrations:

```
001-020: Core ecommerce
  • Products, variants, pricing
  • Cart management
  • Orders, payments, fulfillment
  • Customer accounts

021-030: Customer features
  • Reviews and ratings
  • Wishlist and browse history
  • Referral system
  • Loyalty points

031-040: CMS & content
  • Blog posts
  • Pages + inline editing
  • Change logs
  • Page views analytics

041-050: Marketing
  • Email templates
  • Email campaigns + analytics
  • Waitlist system
  • Waitlist campaigns

051-054: Automation
  • Workflow builder
  • Workflow execution engine
  • Test runs

055: Security
  • RLS policies (all 8 custom tables)
  • Admin role system
  • OAuth token encryption
  • View security (SECURITY INVOKER)
```

### 30+ Tables (Business Logic)

Core tables organized by feature:

**Products & Shop:**
- `product`, `product_variant`, `product_review`, `product_waitlist`
- `product_categories`, `product_category_mappings`
- `cart`, `cart_item`, `order`, `order_item`, `fulfillment`

**Customers:**
- `customer`, `saved_addresses`
- `loyalty_points`, `referral_credit`

**Content Management:**
- `blog_posts`, `page_content`, `page_content_history`, `pages`
- `changelog_entries`, `page_views`

**Marketing & Analytics:**
- `email_template`, `campaign`, `campaign_recipient`
- `campaign_opens`, `campaign_clicks`, `waitlist_campaign`

**Workflows & Automation:**
- `workflow`, `workflow_trigger`, `workflow_action`, `workflow_execution`
- `workflow_test_run`

**Admin & Security:**
- `user_roles` - Admin role system
- `google_calendar_tokens` - OAuth credentials (encrypted)

### 50+ Indexes (Performance)

Indexes are created for:
- Primary operations (filtering, sorting)
- RLS policies (fast user_id lookups)
- Analytics queries (aggregations)
- Text search (JSONB, array operations)

---

## Security Model (RLS)

NeedThisDone uses a **three-tier Row-Level Security (RLS) pattern**:

### Layer 1: User Ownership

Users access only their own data:

```sql
CREATE POLICY "Users see their own orders"
  ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());
```

**Applies to:** `saved_addresses`, `product_waitlist`, `orders`, etc.

### Layer 2: Admin Access

Admins see everything using a secure role system:

```sql
CREATE POLICY "Admins see all orders"
  ON public.orders
  FOR SELECT
  USING (public.is_admin(auth.uid()));
```

**Key concept:** `is_admin()` checks a `user_roles` table (server-side), NOT user-editable JWT metadata.

**Never do this:**
```sql
-- WRONG: Uses editable JWT metadata
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
```

**Always do this:**
```sql
-- CORRECT: Checks server-side user_roles table
USING (public.is_admin(auth.uid()))
```

### Layer 3: Service Role Bypass

Backend services (Node.js, Python, etc.) use the `SUPABASE_SERVICE_ROLE_KEY`, which automatically bypasses RLS:

```typescript
// Service role has full access (no RLS filtering)
const { data } = await supabase
  .from('orders')
  .select('*')
  .rpc('admin_function');  // Service role used on backend
```

**Important:** Only use service role in secure server contexts (API routes, webhooks, cron jobs). Never expose it to the frontend.

### Public Read Access

Some tables allow public reads (with admin-only writes):

```sql
-- Public can browse categories
CREATE POLICY "Anyone can read categories"
  ON public.product_categories
  FOR SELECT
  USING (true);

-- Only admins can edit
CREATE POLICY "Admins modify categories"
  ON public.product_categories
  FOR INSERT, UPDATE, DELETE
  USING (public.is_admin(auth.uid()));
```

---

## Common Tasks

### Running Migrations

Migrations run automatically with `supabase db reset`. To run them manually:

```bash
supabase migration up
```

To see the current schema:

```bash
supabase db dump --schema-only > schema.sql
```

### Seeding Test Data

```bash
supabase db reset
```

This runs all migrations + executes `supabase/seed.sql`.

To add more test data:
1. Edit `supabase/seed.sql`
2. Run `supabase db reset`

### Testing RLS Policies

Use Supabase Studio (http://127.0.0.1:54323):

1. Go to **SQL Editor**
2. Select a table
3. Try reading/writing as different users:

```sql
-- Test as public (unauthenticated)
SELECT * FROM public.product_categories;  -- Should work (public read)

-- Test as admin
SELECT * FROM public.product_waitlist;    -- Should work (admin)

-- Test as regular user
SELECT * FROM public.product_waitlist
WHERE email = 'user@example.com';         -- Should only see their entries
```

### Creating a Test User

In Supabase Studio:

1. Navigate to **Authentication** → **Users**
2. Click **Create New User**
3. Enter email + password
4. Copy the **UUID**
5. In `seed.sql`, update the admin role INSERT:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-uuid-here'::UUID, 'admin');
```

Then run `supabase db reset`.

### Connecting to PostgreSQL Directly

Use any PostgreSQL client:

```bash
# psql (command line)
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# or with pgAdmin, DataGrip, etc.
# Just use: localhost:54322
```

---

## Troubleshooting

### "supabase: command not found"

Install the Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# Linux
brew install supabase/tap/supabase

# Windows
# Use Homebrew on WSL2, or download from GitHub releases
```

### Docker not running

Make sure Docker Desktop is open:

```bash
# Check if Docker is running
docker ps

# If it fails, open Docker Desktop from Applications
```

### Migrations fail

Check the logs:

```bash
supabase logs
```

Common issues:
- **Syntax error:** Check migration SQL for typos
- **Constraint violation:** Data conflicts with new constraints
- **Missing extension:** Some features require PostgreSQL extensions

Reset and try again:

```bash
supabase stop
supabase start
supabase db reset
```

### RLS policies blocking queries

This is intentional—RLS is working. To debug:

1. Check which policies exist:

```sql
SELECT tablename, policyname, qual FROM pg_policies
WHERE tablename = 'your_table';
```

2. Test the policy logic:

```sql
-- Set your user context
SET request.jwt.claims.sub TO 'your-uuid-here';

-- Try the query (should work if policy correct)
SELECT * FROM your_table;
```

3. If a query should work but doesn't, check:
   - Are you authenticated? (Some policies require `auth.uid()`)
   - Are you an admin? (Check `user_roles` table)
   - Does the policy reference the right column?

### Schema out of sync

Reset the entire database to a clean state:

```bash
supabase db reset
```

This:
1. Drops all tables
2. Runs all 55 migrations in order
3. Seeds test data from `seed.sql`

---

## Environment Variables

### For Local Development

Copy these to `app/.env.local`:

```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin email (used in seed.sql)
SUPABASE_ADMIN_EMAIL=admin@needthisdone.com
```

Get the actual keys from:

```bash
supabase status
```

### For Production

Production uses hosted Supabase (different project). Never commit production keys to Git.

---

## Performance Tips

### Query Optimization

Use indexes for common filters:

```sql
-- Queries on user_id are common (RLS policies)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Queries on created_at are common (sorting, date ranges)
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### Materialized Views

For expensive aggregations, use materialized views:

```sql
CREATE MATERIALIZED VIEW public.popular_products AS
SELECT p.id, COUNT(oi.id) AS order_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id
ORDER BY order_count DESC;
```

Then refresh periodically:

```bash
REFRESH MATERIALIZED VIEW popular_products;
```

---

## Security Checklist

Before deploying migrations:

- [ ] Run `supabase db lint` (0 errors expected)
- [ ] Run `supabase db reset` locally (verify all migrations work)
- [ ] Test RLS policies in Studio (try different user roles)
- [ ] Check for `auth.users` exposure in views (should only reference user_id)
- [ ] Verify sensitive credentials are encrypted (e.g., OAuth tokens)
- [ ] Run `npm run test:e2e` (API tests verify policies work)

---

## Next Steps

See the complete database documentation:

- **Architecture & Design:** `supabase/docs/DATABASE_ARCHITECTURE.md`
- **Security Deep-Dive:** `supabase/docs/POSTGRESQL_SECURITY.md`
- **Docker Orchestration:** `supabase/docs/DOCKER_SETUP.md`
- **Database Conventions:** `supabase/CLAUDE.md`

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)

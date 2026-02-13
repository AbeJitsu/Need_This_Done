# Database Architecture

## Overview

NeedThisDone's database is a production-grade PostgreSQL schema built on Supabase, spanning 55 migrations and 30+ tables organized around distinct business domains. The architecture prioritizes security (100+ RLS policies), scalability (50+ performance indexes), and maintainability (comprehensive audit trails on every table).

**Key Facts:**
- **55 migrations** - Well-documented schema evolution from project inception
- **30+ tables** - Custom business logic + Medusa commerce integration
- **100+ RLS policies** - Three-tier security model (user ownership, admin access, service role bypass)
- **50+ indexes** - Performance-optimized query paths for common operations
- **Advanced features** - pgvector embeddings, JSONB documents, materialized views, database functions

## Migration Timeline

The schema evolved in five coherent phases:

| Phase | Migrations | Timeline | Purpose |
|-------|-----------|----------|---------|
| **Core Ecommerce** | 001-020 | Foundation | Product catalog, orders, payments (Medusa integration) |
| **Customer Features** | 021-030 | Growth | User accounts, preferences, addresses, ratings |
| **CMS & Content** | 031-040 | Content | Blog posts, pages, inline editing, version history |
| **Marketing** | 041-050 | Engagement | Email campaigns, waitlists, analytics, loyalty programs |
| **Automation & Security** | 051-055 | Operations | Workflow automation, security hardening (RLS, encryption, admin system) |

This progression mirrors the product roadmap: launch commerce foundation, add customer management, enable content editing, build marketing capabilities, then harden for production.

## Schema Organization by Domain

### Ecommerce Core (Medusa Backend)

These tables are managed by the Medusa backend and accessed via the Medusa API, not directly via PostgREST:
- `product` - Product catalog with metadata
- `product_variant` - SKU variants
- `order` - Orders with shipping/billing
- `order_item` - Line items
- `order_fulfillment` - Fulfillment tracking
- `cart` - Shopping carts
- `payment` - Payment records
- `customer` - Medusa customer records

### Customer Management

Custom tables handling customer data within NeedThisDone:
- `saved_addresses` - Shipping address management (RLS: user ownership)
- `product_waitlist` - Out-of-stock signup tracking (RLS: email-based + admin)
- `user_roles` - Admin authorization (RLS: owner + admin read)
- `customers` - Customer metadata and preferences

### Content Management & Editing

Inline editing system allowing drag-and-drop page/section management:
- `pages` - Page definitions (RLS: admin write, public read)
- `page_content` - Section content stored as JSONB (RLS: admin write)
- `page_content_history` - Version history (RLS: admin read)
- `page_views` - Analytics (RLS: admin read only)
- `blog_posts` - Blog articles (RLS: admin write, public read)
- `changelog_entries` - Product changelog (RLS: admin write, public read)

### Email & Marketing

Campaign management and analytics:
- `email_templates` - Reusable email templates (RLS: admin write)
- `waitlist_campaigns` - Targeted campaigns to waitlist members (RLS: admin only)
- `waitlist_campaign_recipients` - Campaign recipient tracking (RLS: admin read)
- `campaign_opens` - Email open analytics (RLS: admin read)
- `campaign_clicks` - Email link click tracking (RLS: admin read)

### Product Management

Shop-specific features beyond core Medusa:
- `product_categories` - Shop categories (RLS: public read, admin write)
- `product_category_mappings` - Products to categories (RLS: public read, admin write)
- `reviews` - Customer product reviews (RLS: public read, admin moderation)

### Automation

Workflow automation system:
- `workflows` - Workflow definitions with React Flow JSON
- `workflow_triggers` - Event mappings
- `workflow_actions` - Action configurations
- `workflow_conditions` - Condition logic
- `workflow_executions` - Execution logs and test runs

### OAuth & Integrations

Third-party authentication and API tokens:
- `google_calendar_tokens` - Encrypted Google OAuth tokens (RLS: owner + admin)
- `oauth_providers` - OAuth configuration (RLS: admin only)

### Analytics & Loyalty

Customer engagement metrics:
- `loyalty_points` - Points balance per customer
- `referral_codes` - Unique referral URLs
- `project_comments` - Internal project notes (RLS: owner + admin)

### Commerce Details

Supporting tables:
- `enrollments` - Course/service enrollments
- `quotes` - Project quotes (RLS: admin only)
- `subscriptions` - Recurring billing (RLS: admin only, Stripe synced)
- `stripe_customers` - Stripe customer references (RLS: admin only)
- `deposits` - Project deposit tracking

## Entity Relationships (Simplified)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ECOMMERCE FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Customer ──┐                                                      │
│              ├──→ Cart ──→ Order ──→ Payment ──┐                  │
│              └────────────────────────────────┘                    │
│                                                │                   │
│                                                └──→ OrderItem      │
│                                                    ├──→ Product    │
│                                                    └──→ Variant    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      MARKETING FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ProductWaitlist ──┐                                              │
│                     ├──→ WaitlistCampaign ──→ CampaignRecipient    │
│   Customer ─────────┘                              │               │
│                                                     ├──→ EmailOpen  │
│                                                     └──→ EmailClick │
│                                                                     │
│   LoyaltyPoints ←── (earned from Order)                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       CONTENT FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Page ──→ PageContent (JSONB) ──→ PageContentHistory             │
│             │                                                      │
│             └──→ PageView (analytics)                             │
│                                                                     │
│   BlogPost ──→ (public read, admin write)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     AUTOMATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Workflow ──→ Trigger ──→ Condition ──→ Action ──→ Execution     │
│                                                                     │
│   Event (e.g., order placed) ──→ [trigger matches]                │
│                                   [conditions evaluate]            │
│                                   [actions execute]                │
│                                   [execution logged]               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Security Model: Three-Tier RLS Pattern

Every table exposed via PostgREST has row-level security policies following this pattern:

### Layer 1: User Ownership (Default Access)

Users can access their own data using `auth.uid()`:

```sql
CREATE POLICY "Users access own records"
  ON public.saved_addresses
  FOR ALL
  USING (user_id = auth.uid());
```

**Tables using this pattern:**
- `saved_addresses` - Own shipping addresses
- `user_roles` - Own role (read-only)
- `project_comments` - Own comments

### Layer 2: Admin Access (Special Privilege)

Admins can access all data using the `is_admin()` function:

```sql
CREATE POLICY "Admins access all records"
  ON public.saved_addresses
  FOR ALL
  USING (public.is_admin(auth.uid()));
```

Admin status is stored in a server-side `user_roles` table (not JWT metadata):

```sql
-- Check if user is admin
SELECT public.is_admin(auth.uid());

-- Grant admin role (service role only)
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'admin');
```

**Why not JWT metadata?** JWT user_metadata is editable by the client. Users can modify `supabase.auth.updateUser({ data: { role: 'admin' } })`, making it unsuitable for security decisions. The `user_roles` table provides server-side truth.

**Tables using admin checks:**
- `blog_posts` - Content management
- `page_content` - Inline editing
- `campaign_opens/clicks` - Email analytics
- `waitlist_campaigns` - Campaign management
- All CRUD operations on administrative data

### Layer 3: Service Role (Backend Bypass)

The service role (backend API) automatically bypasses RLS. No policies needed:

```typescript
// Backend has full access
const { data } = await supabase
  .from('orders')
  .select('*')
  .rpc('create_subscription', {...}, {
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
  });
```

**Benefit:** Backend can read/write all data for operations like:
- Creating subscriptions
- Processing orders
- Sending email campaigns
- Synchronizing Stripe webhooks

## Advanced Features

### pgvector: Semantic Search & AI Embeddings

The schema includes support for AI embeddings via pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Embedding vectors stored as BYTEA
ALTER TABLE blog_posts ADD COLUMN embedding vector(1536);

-- GIN index for fast similarity search
CREATE INDEX idx_blog_posts_embedding ON blog_posts
  USING gin(embedding);

-- Query: Find similar posts
SELECT id, title
FROM blog_posts
ORDER BY embedding <-> query_embedding
LIMIT 5;
```

**Use case:** Powering "related posts" recommendations and semantic search across content.

### JSONB: Flexible Schema Design

Several tables use JSONB to store flexible structured data:

**`page_content`** - Stores rich content blocks without schema changes:
```json
{
  "blocks": [
    {
      "type": "heading",
      "props": { "level": 1, "text": "Welcome" }
    },
    {
      "type": "paragraph",
      "props": { "text": "Start your journey here" }
    }
  ]
}
```

**`workflows`** - React Flow canvas saved as JSON:
```json
{
  "nodes": [
    {
      "id": "trigger_1",
      "type": "trigger",
      "data": { "triggerType": "order_created" }
    }
  ],
  "edges": [...]
}
```

**Benefits:**
- Schema evolution without migrations
- Rich queries with `@>`, `->` operators
- GIN indexes for performance

### Materialized Views: Pre-Aggregated Analytics

Materialized views compute expensive aggregations once and cache results:

```sql
CREATE MATERIALIZED VIEW public.page_view_stats WITH (security_invoker = true) AS
SELECT
  page_id,
  DATE(viewed_at) AS view_date,
  COUNT(*) AS view_count,
  COUNT(DISTINCT user_id) AS unique_visitors
FROM public.page_views
WHERE is_admin(auth.uid())
GROUP BY page_id, DATE(viewed_at);

-- Refresh on-demand (e.g., via cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY page_view_stats;
```

**Used for:**
- Analytics dashboards (fast aggregations)
- Performance reporting (pre-computed metrics)
- Admin views requiring heavy joins

### Database Functions: Business Logic at the Database Layer

Custom functions enforce business rules within the database:

```sql
-- Create order with automatic deposit calculation
CREATE FUNCTION public.create_project_order(
  customer_id UUID,
  amount INTEGER
)
RETURNS TABLE (order_id UUID, deposit_amount INTEGER) AS $$
BEGIN
  -- Insert order
  INSERT INTO orders (customer_id, total, status) VALUES (customer_id, amount, 'pending')
  RETURNING id INTO order_id;

  -- Calculate 50% deposit
  INSERT INTO deposits (order_id, amount, due_date)
  VALUES (order_id, amount / 2, now() + interval '7 days');

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Benefits:**
- Atomic transactions (single round-trip)
- Enforcement even if client bypasses API
- Performance (no round-trips)

## Performance Architecture

### Index Strategy (50+ Indexes)

Indexes are created for three categories of queries:

**1. Foreign Key Lookups**
```sql
-- Speed up order → customer joins
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

**2. RLS Filtering**
```sql
-- Speed up auth.uid() policy checks
CREATE INDEX idx_saved_addresses_user_id ON saved_addresses(user_id);
```

**3. Common Queries**
```sql
-- Speed up blog listing by published date
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
```

### Query Optimization Patterns

All queries follow these principles:

- **Use indexes for filtering** - Never SELECT * without WHERE
- **Eager load relationships** - Use JOINs, not N+1 queries
- **Aggregate in database** - Use COUNT, SUM, etc., not in application
- **Limit result sets** - Always add LIMIT, especially for analytics

Example optimized query:

```typescript
// Good: Single query with index, no N+1
const orders = await supabase
  .from('orders')
  .select(`
    id, total, customer_id,
    customer:customers(name, email)  // eager load
  `)
  .eq('status', 'completed')
  .order('created_at', { ascending: false })
  .limit(50);

// Bad: N+1 query pattern
const orders = await supabase.from('orders').select('*');
for (const order of orders) {
  const customer = await supabase.from('customers').select('*').eq('id', order.customer_id);
}
```

## Audit Trails: Tracking Data Changes

Every table includes:

```sql
created_at TIMESTAMPTZ DEFAULT now(),    -- When row created
updated_at TIMESTAMPTZ DEFAULT now(),    -- When row last modified
created_by UUID REFERENCES auth.users,   -- Who created
```

**Usage:** Enables audit logs, change tracking, and compliance:

```typescript
// Find who modified a blog post last
const { data } = await supabase
  .from('page_content_history')
  .select('created_by, created_at')
  .eq('page_id', pageId)
  .order('created_at', { ascending: false })
  .limit(1);
```

## Data Integrity Constraints

All tables enforce integrity at the database layer:

**Primary Keys** - Unique identifier for each row:
```sql
PRIMARY KEY (id)
```

**Foreign Keys** - Enforce referential integrity:
```sql
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
```

**ENUMs** - Restrict column values to valid options:
```sql
role TEXT CHECK (role IN ('admin', 'customer'))
```

**NOT NULL** - Require essential fields:
```sql
title TEXT NOT NULL,
email TEXT NOT NULL UNIQUE
```

**UNIQUE** - Prevent duplicate values:
```sql
UNIQUE (email),  -- One account per email
UNIQUE (slug)    -- Clean URLs
```

## Production Considerations

### Monitoring & Alerting

Production deployment requires monitoring:

**Connection Pool Health**
- Monitor active connections (should stay < 80% of pool size)
- Alert on long-running queries (> 30s)
- Track transaction wait times

**Index Health**
- Monitor index bloat (> 10% = reindex)
- Track missing indexes (slow queries)
- Identify unused indexes (remove them)

**RLS Policy Performance**
- Policies add overhead; monitor policy evaluation time
- Avoid expensive subqueries in USING clauses
- Use indexes to speed policy checks

### Backup & Disaster Recovery

**Backup Strategy:**
- Daily automated backups (Supabase Cloud does this automatically)
- Weekly full schema dumps for version control
- Point-in-time recovery enabled (standard on Supabase Pro)

**Recovery Procedure:**
1. Restore from backup to temporary project
2. Validate data integrity
3. Migrate to production
4. Rollback if needed

### Scaling

**Vertical Scaling (Single Database):**
- Handles 1M+ rows per table
- Can serve 1000+ concurrent connections
- Scales to petabytes with proper indexing

**Horizontal Scaling (If Needed):**
- Read replicas for reporting
- Sharding by customer for SaaS multi-tenancy
- Archive old data to data warehouse (PostgreSQL → BigQuery)

### Connection Pooling

Supabase manages connection pooling automatically:
- Pool size: 3-10 connections depending on project tier
- Session reuse: ~30-60s idle timeout
- Connection limits: Enforced per role (anonymous, authenticated, service)

### Encryption at Rest

Supabase encrypts all data at rest using AES-256. Sensitive fields like OAuth tokens are additionally encrypted using pgcrypto:

```sql
-- Encrypt sensitive tokens
access_token_encrypted BYTEA  -- Encrypted with pgp_sym_encrypt()
```

## Summary

The NeedThisDone database architecture demonstrates production-grade PostgreSQL design:

- **Security first** - RLS policies on every exposed table, encrypted credentials, secure admin system
- **Scalability** - 50+ indexes, materialized views, efficient queries
- **Maintainability** - 55 well-documented migrations, audit trails, clear naming conventions
- **Flexibility** - JSONB for content, pgvector for embeddings, database functions for business logic

This architecture supports complex ecommerce, content management, and automation features while maintaining strong data protection and operational visibility.

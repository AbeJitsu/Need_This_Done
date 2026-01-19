# Supabase Database Reference

Quick reference for CRUD operations on all tables.

## Table Overview

| Table | Purpose | RLS |
|-------|---------|-----|
| `demo_items` | Database demo component | Public read/write |
| `projects` | Contact form submissions | Public insert, auth read |
| `project_comments` | Client-admin communication | Auth only |
| `pages` | Puck CMS pages | Public read published, admin write |
| `page_content` | Marketing page content | Public read, admin write |
| `page_content_history` | Content version history | Admin only |
| `orders` | Medusa order links | User owns, admin all |
| `stripe_customers` | Stripe customer mapping | User owns, admin all |
| `subscriptions` | Stripe subscriptions | User owns, admin all |
| `payments` | Payment records | User owns, admin all |
| `appointment_requests` | Consultation bookings | Customer by email, admin all |
| `google_calendar_tokens` | OAuth tokens | Service role only |
| `blog_posts` | Blog content | Public read published, admin write |
| `page_views` | Analytics | Service role |
| `enrollments` | LMS course enrollment | User owns |
| `cart_reminders` | Abandoned cart emails | Service role |
| `product_interactions` | Product analytics | Service role |
| `coupons` | Discount codes | Public read active, service write |
| `coupon_usage` | Coupon tracking | User owns |
| `currencies` | Currency rates | Public read |
| `reviews` | Product reviews | Public read approved |
| `review_votes` | Helpful votes | Public |
| `review_reports` | Review moderation | Auth create, admin manage |
| `marketplace_templates` | Template marketplace | Public read approved |
| `template_purchases` | Template purchases | User owns |
| `template_reviews` | Template reviews | Public read, user owns |
| `quotes` | Project quotes | Admin manage, customer by email |
| `changelog_entries` | Public changelog | Public read, admin write |

---

## Core Tables

### projects
Contact form submissions / project inquiries.

```sql
-- Schema
id UUID PRIMARY KEY
name TEXT NOT NULL
email TEXT NOT NULL
company TEXT
service TEXT
message TEXT NOT NULL
attachments TEXT[]
status project_status  -- 'submitted', 'in_review', 'scheduled', 'in_progress', 'completed'
user_id UUID           -- Optional link to auth.users
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Create (public - contact form)
INSERT INTO projects (name, email, company, service, message)
VALUES ('John Doe', 'john@example.com', 'Acme Inc', 'web-development', 'Need a website');

-- Read (requires auth)
SELECT * FROM projects ORDER BY created_at DESC;

-- Update status (requires auth)
UPDATE projects SET status = 'in_review' WHERE id = 'uuid';
```

### project_comments
Back-and-forth communication on projects.

```sql
-- Schema
id UUID PRIMARY KEY
project_id UUID NOT NULL REFERENCES projects(id)
user_id UUID NOT NULL REFERENCES auth.users(id)
content TEXT NOT NULL
is_internal BOOLEAN DEFAULT false  -- Admin-only notes
created_at TIMESTAMPTZ

-- Add comment (auth required, user_id must match auth.uid())
INSERT INTO project_comments (project_id, user_id, content, is_internal)
VALUES ('project-uuid', auth.uid(), 'Thanks for reaching out!', false);

-- Read comments (non-internal for customers, all for admins)
SELECT * FROM project_comments WHERE project_id = 'uuid' ORDER BY created_at;
```

### orders
Links Medusa orders to Supabase users.

```sql
-- Schema
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
medusa_order_id TEXT NOT NULL UNIQUE
total INTEGER                    -- Amount in cents
status TEXT                      -- 'pending', 'completed', 'canceled'
email TEXT
quote_id UUID REFERENCES quotes(id)
stripe_payment_intent_id TEXT
payment_status TEXT              -- 'pending', 'paid', 'failed', 'refunded'
requires_appointment BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Create order
INSERT INTO orders (user_id, medusa_order_id, total, status, email)
VALUES (auth.uid(), 'order_123', 5000, 'pending', 'user@example.com');

-- User's orders
SELECT * FROM orders WHERE user_id = auth.uid() ORDER BY created_at DESC;
```

---

## CMS Tables

### pages
Full Puck CMS pages (visual editor).

```sql
-- Schema
id UUID PRIMARY KEY
slug TEXT NOT NULL UNIQUE
title TEXT NOT NULL
content JSONB NOT NULL           -- Puck page structure
is_published BOOLEAN DEFAULT false
published_at TIMESTAMPTZ
created_by UUID REFERENCES auth.users(id)
updated_by UUID REFERENCES auth.users(id)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Read published page
SELECT * FROM pages WHERE slug = 'about' AND is_published = true;

-- Admin: Create page
INSERT INTO pages (slug, title, content, created_by)
VALUES ('new-page', 'New Page', '{"root":{},"content":[]}', auth.uid());

-- Admin: Publish
UPDATE pages SET is_published = true WHERE slug = 'new-page';
```

### page_content
Marketing page content (hybrid CMS - code layout, editable content).

```sql
-- Schema
id UUID PRIMARY KEY
page_slug TEXT NOT NULL UNIQUE   -- 'pricing', 'faq', 'services', etc.
content_type TEXT NOT NULL       -- 'pricing_page', 'faq_page', etc.
content JSONB NOT NULL           -- Varies by content_type
updated_by UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Read page content
SELECT content FROM page_content WHERE page_slug = 'pricing';

-- Admin: Update content
UPDATE page_content
SET content = '{"title": "New Title", "items": [...]}', updated_by = auth.uid()
WHERE page_slug = 'pricing';
```

### blog_posts
Blog content management.

```sql
-- Schema
id UUID PRIMARY KEY
slug TEXT NOT NULL UNIQUE
title TEXT NOT NULL
excerpt TEXT
content TEXT NOT NULL            -- Markdown or plain text
puck_content JSONB               -- Optional rich layout
featured_image TEXT
tags TEXT[]
category TEXT                    -- 'tips', 'case-study', 'news'
status TEXT DEFAULT 'draft'      -- 'draft', 'published', 'archived'
published_at TIMESTAMPTZ
source TEXT                      -- 'linkedin', 'original', 'newsletter'
source_url TEXT
author_id UUID REFERENCES auth.users(id)
author_name TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Public: Read published posts
SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC;

-- Admin: Create post
INSERT INTO blog_posts (slug, title, content, author_id, author_name)
VALUES ('my-post', 'My Post', 'Content here...', auth.uid(), 'Admin');

-- Admin: Publish
UPDATE blog_posts SET status = 'published' WHERE slug = 'my-post';
```

---

## E-commerce Tables

### stripe_customers
Maps Supabase users to Stripe.

```sql
-- Schema
id UUID PRIMARY KEY
user_id UUID UNIQUE REFERENCES auth.users(id)
stripe_customer_id TEXT UNIQUE NOT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Service role: Create/update
INSERT INTO stripe_customers (user_id, stripe_customer_id)
VALUES ('user-uuid', 'cus_xxx')
ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id;
```

### subscriptions
Active Stripe subscriptions.

```sql
-- Schema
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
stripe_subscription_id TEXT UNIQUE NOT NULL
stripe_price_id TEXT NOT NULL
status TEXT NOT NULL             -- 'active', 'canceled', 'past_due', 'trialing', 'incomplete'
current_period_start TIMESTAMPTZ
current_period_end TIMESTAMPTZ
cancel_at_period_end BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- User's active subscription
SELECT * FROM subscriptions WHERE user_id = auth.uid() AND status = 'active';
```

### coupons
Discount codes.

```sql
-- Schema
id UUID PRIMARY KEY
code TEXT NOT NULL UNIQUE
name TEXT NOT NULL
description TEXT
discount_type TEXT NOT NULL      -- 'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
discount_value DECIMAL(10,2)
minimum_order_amount INTEGER     -- In cents
max_uses INTEGER
max_uses_per_customer INTEGER DEFAULT 1
current_uses INTEGER DEFAULT 0
starts_at TIMESTAMPTZ
expires_at TIMESTAMPTZ
is_active BOOLEAN DEFAULT true
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Validate coupon (use function)
SELECT * FROM validate_coupon('SAVE20', 5000, 3, auth.uid(), 'user@example.com', false);

-- Apply coupon after order (use function)
SELECT apply_coupon('coupon-uuid', auth.uid(), 'order_123', 1000, 5000, 'user@example.com');
```

### reviews
Product reviews.

```sql
-- Schema
id UUID PRIMARY KEY
product_id VARCHAR(255) NOT NULL  -- Medusa product ID
user_id UUID REFERENCES auth.users(id)
order_id VARCHAR(255)
rating INTEGER NOT NULL           -- 1-5
title VARCHAR(255)
content TEXT
reviewer_name VARCHAR(255)
reviewer_email VARCHAR(255)
is_verified_purchase BOOLEAN DEFAULT false
images TEXT[]
status VARCHAR(20) DEFAULT 'pending'  -- 'pending', 'approved', 'rejected'
helpful_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Public: Read approved reviews
SELECT * FROM reviews WHERE product_id = 'prod_xxx' AND status = 'approved' ORDER BY created_at DESC;

-- Get product rating summary (use function)
SELECT get_product_rating('prod_xxx');

-- Vote helpful (use function)
SELECT vote_on_review('review-uuid', 'helpful', auth.uid(), NULL);
```

---

## Quotes & Appointments

### quotes
Project quotes with deposit tracking.

```sql
-- Schema
id UUID PRIMARY KEY
reference_number TEXT UNIQUE NOT NULL  -- Format: NTD-MMDDYY-HHMM
project_id UUID REFERENCES projects(id)
customer_name TEXT NOT NULL
customer_email TEXT NOT NULL
total_amount INTEGER NOT NULL     -- In cents
deposit_amount INTEGER NOT NULL   -- Always 50% of total
status TEXT DEFAULT 'draft'       -- 'draft', 'sent', 'authorized', 'deposit_paid', 'balance_paid', 'completed', 'expired', 'cancelled'
expires_at TIMESTAMPTZ NOT NULL
notes TEXT
line_items JSONB DEFAULT '[]'     -- [{description, amount}]
stripe_payment_intent_id TEXT
stripe_balance_payment_intent_id TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Generate reference number (use function)
SELECT generate_quote_reference();  -- Returns 'NTD-011825-1430'

-- Admin: Create quote
INSERT INTO quotes (reference_number, customer_name, customer_email, total_amount, deposit_amount, expires_at)
VALUES (generate_quote_reference(), 'John Doe', 'john@example.com', 100000, 50000, now() + interval '30 days');
```

### appointment_requests
Consultation scheduling.

```sql
-- Schema
id UUID PRIMARY KEY
order_id UUID NOT NULL REFERENCES orders(id)
customer_email TEXT NOT NULL
customer_name TEXT
preferred_date DATE NOT NULL
preferred_time_start TIME NOT NULL
preferred_time_end TIME
alternate_date DATE
alternate_time_start TIME
duration_minutes INTEGER DEFAULT 30
notes TEXT
status appointment_status         -- 'pending', 'approved', 'modified', 'cancelled', 'completed'
admin_notes TEXT
scheduled_at TIMESTAMPTZ
google_event_id TEXT
google_event_link TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Note: Business hours validation (9 AM - 5 PM, Mon-Fri) is enforced by trigger
```

---

## LMS Tables

### enrollments
Course enrollment tracking.

```sql
-- Schema
id UUID PRIMARY KEY
user_id UUID NOT NULL REFERENCES auth.users(id)
course_id UUID NOT NULL REFERENCES pages(id)
enrollment_type TEXT NOT NULL     -- 'free', 'paid'
payment_id TEXT
amount_paid INTEGER DEFAULT 0
progress INTEGER DEFAULT 0        -- 0-100
completed_at TIMESTAMPTZ
enrolled_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(user_id, course_id)

-- Enroll user
INSERT INTO enrollments (user_id, course_id, enrollment_type)
VALUES (auth.uid(), 'course-uuid', 'free')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Update progress
UPDATE enrollments SET progress = 50 WHERE user_id = auth.uid() AND course_id = 'course-uuid';

-- Check enrollment
SELECT * FROM enrollments WHERE user_id = auth.uid() AND course_id = 'course-uuid';
```

---

## Marketplace Tables

### marketplace_templates
Template marketplace listings.

```sql
-- Schema
id UUID PRIMARY KEY
author_id UUID NOT NULL REFERENCES auth.users(id)
author_name VARCHAR(255) NOT NULL
name VARCHAR(255) NOT NULL
slug VARCHAR(255) NOT NULL UNIQUE
description TEXT
category VARCHAR(50) NOT NULL     -- 'business', 'portfolio', 'blog', 'ecommerce', 'landing', 'saas', 'personal', 'creative'
tags TEXT[]
content JSONB NOT NULL            -- Puck page structure
thumbnail_url TEXT
preview_images TEXT[]
price_type VARCHAR(20) DEFAULT 'free'  -- 'free', 'paid'
price_cents INTEGER DEFAULT 0
download_count INTEGER DEFAULT 0
average_rating DECIMAL(3,2) DEFAULT 0
status VARCHAR(20) DEFAULT 'pending'   -- 'pending', 'approved', 'rejected', 'suspended'
is_featured BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Download template (use function - handles purchase check)
SELECT download_template('template-uuid', auth.uid());
```

---

## Utility Tables

### changelog_entries
Public changelog for /changelog page.

```sql
-- Schema
id UUID PRIMARY KEY
slug TEXT UNIQUE NOT NULL
title TEXT NOT NULL
date DATE NOT NULL DEFAULT CURRENT_DATE
category TEXT NOT NULL DEFAULT 'Public'
description TEXT
benefit TEXT
changes JSONB DEFAULT '[]'        -- [{what, why, where}]
how_to_use JSONB DEFAULT '[]'     -- [instruction strings]
screenshots JSONB DEFAULT '[]'
needs_completion BOOLEAN DEFAULT false
git_context TEXT
affected_routes JSONB DEFAULT '[]'
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Public: Read entries
SELECT * FROM changelog_entries ORDER BY date DESC;

-- Admin: Create entry
INSERT INTO changelog_entries (slug, title, description)
VALUES ('new-feature', 'New Feature', 'Description here');
```

---

## Key Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| `validate_coupon(code, cart_total, item_count, user_id, email, is_first_order)` | Check if coupon is valid | Returns `{is_valid, coupon_id, discount_type, discount_value, discount_amount, error_message}` |
| `apply_coupon(coupon_id, user_id, order_id, discount_applied, order_total, email)` | Record coupon usage | Returns `BOOLEAN` |
| `get_product_rating(product_id)` | Get rating summary | Returns JSON with average, distribution, counts |
| `vote_on_review(review_id, vote_type, user_id, session_id)` | Vote helpful/not helpful | Returns `{success, action}` |
| `download_template(template_id, user_id)` | Download template | Returns `{success, content, name}` or `{error}` |
| `generate_quote_reference()` | Generate quote ref number | Returns `'NTD-MMDDYY-HHMM'` |
| `is_admin()` / `is_admin(user_id)` | Check admin status | Returns `BOOLEAN` |

---

## Common Patterns

### Admin Check in RLS
```sql
COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true', false)
```

### Service Role Bypass
Service role (`SUPABASE_SERVICE_ROLE_KEY`) bypasses all RLS policies. Use for:
- Webhook handlers
- Background jobs
- Analytics recording

### Soft Deletes
Most tables use status fields instead of hard deletes:
- `project_status`: 'submitted' → 'completed'
- `blog status`: 'draft' → 'published' → 'archived'
- `review status`: 'pending' → 'approved' → 'rejected'

### Timestamps
All tables have `created_at` and most have `updated_at` with auto-update triggers.

---

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `product-images` | Product photos | Auth upload, public read |
| `media-library` | General media | Auth upload, public read |

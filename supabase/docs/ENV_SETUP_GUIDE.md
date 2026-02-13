# Environment Variables Setup Guide

This guide explains how to configure your local development environment for NeedThisDone.

## Quick Start

1. Copy the template below
2. Paste into `app/.env.example`
3. Set up your `.env.local` with values from this guide

## Getting Local Supabase Keys

After starting Supabase locally:

```bash
supabase start
supabase status
```

Copy the output to your `.env.local`:

```env
# From 'supabase status' output
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ADMIN_EMAIL=admin@needthisdone.com
```

## Environment Variables Template

**File location:** `app/.env.example` (to be created)

```env
# ============================================================================
# NeedThisDone Environment Variables
# ============================================================================
# Copy this file to .env.local and fill in your values.
# DO NOT commit .env.local to Git (contains secrets).
#
# Some variables are optional (marked with defaults).
# Required variables are marked with [REQUIRED].
# ============================================================================

# ============================================================================
# SUPABASE (Database & Auth)
# ============================================================================

# [REQUIRED] Local Development Supabase URL
# When running locally with 'supabase start', use:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# [REQUIRED] Local Development Anonymous Key
# Get this from: supabase status (after running 'supabase start')
# For production, use your Supabase project's anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleS1pZCIsImlhdCI6MTYxNjc2OTYwMCwiZXhwIjo3OTcxNDU5OTl9.PLACEHOLDER_REPLACE_WITH_REAL_KEY

# [REQUIRED] Service Role Key (Backend Access)
# NEVER expose this to the frontend. Use only in API routes/server functions.
# Get this from: supabase status
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleS1pZCIsImlhdCI6MTYxNjc2OTYwMCwiZXhwIjo3OTcxNDU5OTl9.PLACEHOLDER_REPLACE_WITH_REAL_KEY

# [OPTIONAL] Admin Email (used in seed.sql)
# Default: admin@needthisdone.com
SUPABASE_ADMIN_EMAIL=admin@needthisdone.com

# ============================================================================
# MEDUSA BACKEND (Ecommerce Engine)
# ============================================================================

# [REQUIRED] Medusa Backend URL
# Local: http://localhost:9000
# Production: Your Railway/hosted URL
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000

# [REQUIRED] Medusa Publishable Key
# Get from: Medusa Admin Dashboard → Settings
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_PLACEHOLDER

# [REQUIRED] Medusa Admin API Token
# For admin operations (product management, orders, etc.)
MEDUSA_ADMIN_API_TOKEN=your_admin_token_here

# [REQUIRED] Medusa Admin Email
# Admin user email for Medusa
MEDUSA_ADMIN_EMAIL=admin@needthisdone.com

# [REQUIRED] Medusa Admin Password
# IMPORTANT: Required for all scripts. No fallback available.
MEDUSA_ADMIN_PASSWORD=your_secure_password_here

# ============================================================================
# AUTHENTICATION
# ============================================================================

# [REQUIRED] NextAuth Secret
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here

# [OPTIONAL] NextAuth URL
# Auto-detected in production. Set for local HTTPS testing.
# Default: http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# [OPTIONAL] NextAuth URL Internal
# Used when NextAuth is called internally (within Docker, etc.)
NEXTAUTH_URL_INTERNAL=http://localhost:3000

# ============================================================================
# API & SERVICES
# ============================================================================

# [REQUIRED] Stripe
# Get from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PLACEHOLDER
STRIPE_SECRET_KEY=sk_test_PLACEHOLDER
STRIPE_WEBHOOK_SECRET=whsec_test_PLACEHOLDER

# Price ID for Managed AI subscription (Stripe)
STRIPE_MANAGED_AI_PRICE_ID=price_PLACEHOLDER

# [REQUIRED] Email Service (Resend)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_PLACEHOLDER
RESEND_FROM_EMAIL=noreply@needthisdone.com
RESEND_ADMIN_EMAIL=admin@needthisdone.com
RESEND_WEBHOOK_SECRET=whsec_PLACEHOLDER

# [REQUIRED] OpenAI (AI features)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-PLACEHOLDER

# [REQUIRED] Google OAuth (Calendar sync, Sign in with Google)
# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# [REQUIRED] Redis (Caching)
# Local: redis://localhost:6379
# Production: Use Upstash Redis
REDIS_URL=redis://localhost:6379

# [OPTIONAL] Vector Search Configuration
# For AI embeddings and semantic search
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.8
VECTOR_SEARCH_MAX_RESULTS=10

# ============================================================================
# SITE CONFIGURATION
# ============================================================================

# [OPTIONAL] Site URL
# Used for generating absolute URLs (emails, og:image, etc.)
# Default: http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# [OPTIONAL] Public App URL
# For signup/login redirects, etc.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# [OPTIONAL] Admin Email (for contact forms)
# Default: admin@needthisdone.com
ADMIN_EMAIL=admin@needthisdone.com

# ============================================================================
# CRON JOBS & WEBHOOKS
# ============================================================================

# [REQUIRED] Cron Secret
# Protects cron endpoints from unauthorized execution
# Generate: openssl rand -base64 32
CRON_SECRET=your_cron_secret_here

# [OPTIONAL] Abandoned Cart Reminders
# Hours before sending reminder
ABANDONED_CART_HOURS=24

# [OPTIONAL] Cart Reminder Settings
MAX_CART_REMINDERS=3
REMINDER_INTERVAL_HOURS=24

# [OPTIONAL] Svix (Webhook Management)
SVIX_TOKEN=sk_test_PLACEHOLDER
SVIX_SERVER_URL=http://localhost:8000

# ============================================================================
# DEVELOPMENT & DEBUGGING
# ============================================================================

# [OPTIONAL] Next.js Environment
# Values: development, production, test
NODE_ENV=development

# [OPTIONAL] Skip Emails in Development
# Set to 'true' to prevent sending real emails
SKIP_EMAILS=false

# [OPTIONAL] Debug Mode
# Set to 'true' for verbose logging
DEBUG=false

# [OPTIONAL] Force Reindex Paths
# Comma-separated list of paths to force reindex
NEXT_PUBLIC_FORCE_REINDEX_PATHS=/

# [OPTIONAL] Test Settings
# For E2E testing
TEST_BACKEND_PAGES=false

# ============================================================================
# NOTES
# ============================================================================
#
# 1. GET LOCAL SUPABASE KEYS:
#    After running 'supabase start', run:
#    $ supabase status
#
#    Output includes:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#
# 2. GENERATE SECRET KEYS:
#    $ openssl rand -base64 32
#
# 3. FOR LOCAL DEVELOPMENT:
#    - Use localhost:9000 for Medusa (local setup)
#    - Use localhost:54322 for PostgreSQL
#    - Use http://127.0.0.1:54321 for Supabase API
#
# 4. FOR PRODUCTION:
#    - Never commit .env.local
#    - Use environment variables from your hosting provider
#    - Keep secret keys in Vercel/Railway secrets panel
#
# 5. TESTING:
#    With SKIP_EMAILS=true, email sends are logged but not sent.
#    This is helpful for local development and E2E tests.
#
# ============================================================================
```

## Setup Steps

### 1. Copy the Template

```bash
cp supabase/docs/ENV_SETUP_GUIDE.md app/.env.example
```

Or manually create `app/.env.example` with the template above.

### 2. Get Local Supabase Credentials

```bash
cd /Users/abereyes/Projects/Personal/Need_This_Done

# Start Supabase
supabase start

# Display credentials
supabase status
```

You'll see output like:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create `.env.local`

```bash
cd app
cp .env.example .env.local
```

### 4. Update `.env.local` with Real Values

Edit `app/.env.local` and replace:

- `NEXT_PUBLIC_SUPABASE_URL` → From `supabase status`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → From `supabase status`
- `SUPABASE_SERVICE_ROLE_KEY` → From `supabase status`
- Other service keys (Stripe, Resend, OpenAI, etc.) with your actual API keys

### 5. Start Development

```bash
# Database already running from 'supabase start'
npm run dev

# Visit http://localhost:3000
```

## Testing Local Configuration

To verify your setup is working:

```bash
# Check Supabase connection
curl http://127.0.0.1:54321/auth/v1/health

# Check app can connect
npm run dev
# Visit http://localhost:3000 in your browser
```

## Reference: All Required Services

| Service | Local Dev | How to Get |
|---------|-----------|-----------|
| Supabase | `http://127.0.0.1:54321` | Run `supabase start` → `supabase status` |
| Medusa | `http://localhost:9000` | Run `npm run dev` in medusa-v2 folder |
| Stripe | Test keys | [Stripe Dashboard](https://dashboard.stripe.com) |
| Resend | API key | [Resend Console](https://resend.com/api-keys) |
| OpenAI | API key | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| Google OAuth | Client ID/Secret | [Google Cloud Console](https://console.cloud.google.com) |
| Redis | localhost:6379 | Run `redis-server` (local) or Upstash (prod) |

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not set"

You're missing `.env.local` in the `app/` directory.

```bash
cd app
cp .env.example .env.local
# Then fill in values from `supabase status`
```

### "Cannot connect to Supabase"

Make sure Supabase is running:

```bash
supabase status
# If connection refused, run:
supabase start
```

### "Service not available" errors

Check that required services are running:

- **Supabase:** `supabase status`
- **Medusa:** Running on port 9000?
- **Redis:** Running on port 6379?

## Security Notes

- Never commit `.env.local` (only `.env.example` goes in Git)
- Never paste API keys in messages or share with others
- Rotate keys regularly in production
- Use environment-specific keys (dev keys vs prod keys)

## Next Steps

See the complete database setup:
- `supabase/docs/DATABASE_SETUP.md` - Local development guide
- `supabase/docs/DATABASE_ARCHITECTURE.md` - Schema overview
- `supabase/CLAUDE.md` - Database conventions

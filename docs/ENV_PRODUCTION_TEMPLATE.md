# Production Environment Variables Template

**Copy this entire section to your `.env.production` file on DigitalOcean**

Replace all placeholder values (the ones with `your_...` or `[project]`) with your actual values.

---

```bash
# ============================================================================
# Supabase Configuration (REQUIRED)
# ============================================================================
# Get these from: https://app.supabase.com/project/[your-project]/settings/api

# Your Supabase Cloud project URL
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co

# Public anon key (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (SECRET - server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For Supabase CLI operations only (not needed for runtime)
SUPABASE_ACCESS_TOKEN=sbp_your_access_token_here

# ============================================================================
# Redis Configuration (REQUIRED)
# ============================================================================
# Docker internal URL - keep this exact value
REDIS_URL=redis://redis:6379

# ============================================================================
# Site Configuration (REQUIRED)
# ============================================================================
# Your production domain (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Alternative URL variable (same as above)
NEXT_PUBLIC_URL=https://yourdomain.com

# ============================================================================
# Node Environment (REQUIRED)
# ============================================================================
NODE_ENV=production

# ============================================================================
# Medusa E-commerce Backend (REQUIRED)
# ============================================================================

# Database password for Medusa PostgreSQL
# Generate with: openssl rand -base64 32
MEDUSA_DB_PASSWORD=your_secure_random_password_here

# JWT secret for Medusa auth tokens (min 32 characters)
# Generate with: openssl rand -base64 32
MEDUSA_JWT_SECRET=your_random_jwt_secret_min_32_chars

# Admin JWT secret for Medusa admin panel (min 32 characters)
# Generate with: openssl rand -base64 32
MEDUSA_ADMIN_JWT_SECRET=your_random_admin_jwt_secret_min_32_chars

# Cookie secret for Medusa sessions (min 32 characters)
# Generate with: openssl rand -base64 32
COOKIE_SECRET=your_random_cookie_secret_min_32_chars

# Medusa backend URL (Docker internal - keep this exact value)
MEDUSA_BACKEND_URL=http://medusa:9000

# Admin panel CORS (your production domain or * for any origin)
ADMIN_CORS=https://yourdomain.com

# ============================================================================
# Stripe Payments (REQUIRED for checkout to work)
# ============================================================================
# Get these from: https://dashboard.stripe.com/apikeys

# Secret key (use sk_live_... for production, sk_test_... for testing)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Publishable key (use pk_live_... for production, pk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Webhook secret for Stripe events
# Get from: https://dashboard.stripe.com/webhooks
# After creating webhook endpoint pointing to: https://yourdomain.com/api/stripe/webhook
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================================================
# OpenAI API (REQUIRED for chatbot to work)
# ============================================================================
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# ============================================================================
# Chatbot Configuration (OPTIONAL - has defaults)
# ============================================================================
# Model to use for chat responses
# Options: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
# Default: gpt-4o-mini (recommended for cost efficiency)
NEXT_PUBLIC_CHATBOT_MODEL=gpt-4o-mini

# Maximum tokens per chat response (default: 1000)
# Higher = longer responses but more cost
NEXT_PUBLIC_CHATBOT_MAX_TOKENS=1000

# Temperature for response randomness (0-2, default: 0.7)
# Lower = more focused/deterministic, Higher = more creative/random
NEXT_PUBLIC_CHATBOT_TEMPERATURE=0.7

# ============================================================================
# Embedding Configuration (OPTIONAL - has defaults)
# ============================================================================
# Model for generating embeddings for vector search
# Options: text-embedding-3-small, text-embedding-3-large
# Default: text-embedding-3-small (recommended for cost)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Number of items to process in each batch during indexing
# Default: 100
EMBEDDING_BATCH_SIZE=100

# ============================================================================
# Vector Search Configuration (REQUIRED)
# ============================================================================
# Similarity threshold for vector search (0-1)
# Lower = more results (less strict), Higher = fewer results (more strict)
# 0.5 = balanced, 0.7 = strict, 0.3 = lenient
# Recommendation: 0.5 for production
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.5

# Maximum number of search results to return
# Recommendation: 5 for focused results
VECTOR_SEARCH_MAX_RESULTS=5

# ============================================================================
# Session Configuration (OPTIONAL - not currently used)
# ============================================================================
# These are for iron-session package which is installed but not yet implemented
# Keep them if you plan to add session management in the future

# Session secret for encrypting session cookies (min 32 characters)
# Generate with: openssl rand -base64 32
SESSION_SECRET=your_random_session_secret_min_32_chars

# Session max age in seconds (2592000 = 30 days)
SESSION_MAX_AGE=2592000

# ============================================================================
# Test Accounts (DEV/TEST ONLY)
# ============================================================================
# ⚠️ WARNING: DO NOT include these in production .env!
# Comment out or remove these variables for production deployment
# Only use these for local development and testing

# TEST_ADMIN_EMAIL=testadmin@needthisdone.test
# TEST_ADMIN_PASSWORD=SecurePass123!
# TEST_USER_EMAIL=testuser@needthisdone.test
# TEST_USER_PASSWORD=your-user-password

# ============================================================================
# MCP Server Configuration (OPTIONAL - local development only)
# ============================================================================
# This is for Claude MCP server (context7) - not needed in production
# Only used if you're running Claude Code locally with MCP servers

# CONTEXT7_API_KEY=your_context7_api_key_here
```

---

## How to Generate Secure Random Secrets

On your DigitalOcean server or local terminal, run these commands to generate secure random strings:

```bash
# Generate all secrets at once
echo "MEDUSA_DB_PASSWORD=$(openssl rand -base64 32)"
echo "MEDUSA_JWT_SECRET=$(openssl rand -base64 32)"
echo "MEDUSA_ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
echo "COOKIE_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
```

Copy the output and paste into your `.env.production` file.

---

## Where to Get Your API Keys

### Supabase
1. Go to https://app.supabase.com/project/[your-project]/settings/api
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Toggle "Test mode" OFF for production keys
3. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. For webhook secret:
   - Go to https://dashboard.stripe.com/webhooks
   - Create endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new secret key → `OPENAI_API_KEY`
3. Add billing info if not already done

---

## Deployment Checklist

Before deploying, verify you've updated these values:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Points to Supabase Cloud (not localhost)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Cloud project
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Cloud project
- [ ] `NEXT_PUBLIC_SITE_URL` - Your production domain (not localhost)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `MEDUSA_DB_PASSWORD` - Generated secure random string
- [ ] `MEDUSA_JWT_SECRET` - Generated secure random string
- [ ] `MEDUSA_ADMIN_JWT_SECRET` - Generated secure random string
- [ ] `COOKIE_SECRET` - Generated secure random string
- [ ] `STRIPE_SECRET_KEY` - From Stripe dashboard (live mode)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard (live mode)
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe webhook configuration
- [ ] `OPENAI_API_KEY` - From OpenAI platform
- [ ] `VECTOR_SEARCH_SIMILARITY_THRESHOLD` - Set to `0.5` or tuned value
- [ ] `VECTOR_SEARCH_MAX_RESULTS` - Set to `5` or desired value
- [ ] Test variables commented out or removed

---

## Security Best Practices

1. **Never commit** `.env.production` to git
2. **Use strong passwords** - minimum 32 characters for secrets
3. **Rotate secrets regularly** - especially after team member changes
4. **Limit access** - only trusted team members should see production keys
5. **Use live Stripe keys** only in production (test keys for staging)
6. **Enable 2FA** on Supabase, Stripe, and OpenAI accounts
7. **Monitor usage** - set up alerts for unusual API activity
8. **Backup secrets** - store securely in a password manager (1Password, etc.)

---

## On DigitalOcean Server

To create your production environment file:

```bash
# SSH into your DigitalOcean droplet
ssh root@your-droplet-ip

# Navigate to your project directory
cd /path/to/Need_This_Done

# Create the .env.production file
nano .env.production

# Paste the environment variables from above
# Press Ctrl+X, then Y, then Enter to save

# Verify the file
cat .env.production | grep -v "^#" | grep -v "^$"

# Secure the file (only readable by owner)
chmod 600 .env.production
```

Now you're ready to deploy with:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

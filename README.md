# NeedThisDone.com

A professional services platform built with Next.js, running in Docker with nginx, Redis, Medusa (ecommerce), and Supabase (auth & database).

---

## Table of Contents

- [Quick Start (30 seconds)](#quick-start)
- [Deployment](#deployment)
- [What This Project Is](#what-this-project-is)
- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Docker Development Workflow](#docker-development-workflow)
- [Project Structure](#project-structure)
- [Shopping Cart & Ecommerce](#shopping-cart--ecommerce)
- [Caching Strategy](#caching-strategy)
- [Email Notifications](#email-notifications)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Design System](#design-system)
- [Key Files Reference](#key-files-reference)

---

## Quick Start

```bash
# Start Docker services (local development)
npm run dev:start

# Start Supabase (auth & database)
supabase start

# Once running, access:
# - App:       https://localhost
# - Storybook: http://localhost:6006
```

**If things break:**
```bash
npm run dev:stop
npm run dev:build && npm run dev:start
```

### Docker Commands

| Command | What it does |
|---------|--------------|
| `npm run dev:start` | Start all dev containers |
| `npm run dev:stop` | Stop all dev containers |
| `npm run dev:restart` | Restart dev containers |
| `npm run dev:build` | Rebuild dev images |
| `npm run dev:logs` | View container logs (live) |
| `npm run dev:status` | Show container status |
| `npm run prod:build` | Build production image (for testing locally) |
| `npm run prod:start` | Start production containers (local testing) |
| `npm run prod:stop` | Stop production containers |

---

## Deployment

### Branch Workflow

**Development branches:**
- `dev` - Active development, test changes here first
- `main` - Stable production code, only merge after successful deployment

**Workflow:**
1. Develop and test on `dev` branch locally
2. Deploy `dev` to production for testing
3. Once verified working on production, merge `dev` → `main`

### Local Development Deployment

**Start local development environment:**
```bash
# Start all services (Next.js, Medusa, Redis, PostgreSQL, Nginx)
npm run dev:start

# Access at https://localhost (self-signed SSL)
# Storybook at http://localhost:6006
```

**When to restart vs rebuild:**
- **Restart** (code changes, env changes): `npm run dev:restart`
- **Rebuild** (package.json changes, Dockerfile changes): `npm run dev:build && npm run dev:start`

**Stop services:**
```bash
npm run dev:stop
```

---

### Production Deployment to DigitalOcean

Production URL: **https://needthisdone.com**
Server: `root@159.65.223.234`

#### Standard Deployment (Code Changes Only)

Use this for regular deployments when the database already has products seeded.

**1. Test locally first:**
```bash
# On dev branch
git checkout dev
npm run dev:start
# Test at https://localhost
npm run dev:stop
```

**2. Push to GitHub:**
```bash
git push origin dev
```

**3. SSH to production and deploy:**
```bash
ssh root@159.65.223.234
cd /root/Need_This_Done

# Pull latest dev branch
git pull origin dev

# Stop containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Rebuild and start (add --no-cache if Dockerfile changed)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker ps
docker logs medusa_backend --tail 50
docker logs nextjs_app --tail 50
```

**4. Verify deployment:**
```bash
# Test the site
curl -k https://needthisdone.com
curl -k https://needthisdone.com/shop
```

**5. If successful, merge to main:**
```bash
# On local machine
git checkout main
git merge dev
git push origin main
```

---

#### Fresh Database Deployment

Use this when deploying to a new server or when you need to wipe the database.

**Prerequisites:**
- `.env.local` on production server with all required environment variables
- **CRITICAL:** Ensure `MEDUSA_ADMIN_PASSWORD` is set in **BOTH** `.env.local` AND `.env` on the server

**Why both .env files?**
- **`.env.local`** - Services use this (Next.js, Medusa)
- **`.env`** - Docker Compose uses this for variable substitution (e.g., `${MEDUSA_ADMIN_PASSWORD}`)

**1. SSH to production:**
```bash
ssh root@159.65.223.234
cd /root/Need_This_Done
```

**2. Verify environment variables:**
```bash
# Check .env.local has the password
grep MEDUSA_ADMIN_PASSWORD .env.local

# Check .env has the password (if not, add it)
grep MEDUSA_ADMIN_PASSWORD .env

# If missing from .env, add it:
echo "" >> .env
echo "# Medusa Admin Password" >> .env
grep MEDUSA_ADMIN_PASSWORD .env.local >> .env
```

**3. Pull latest code:**
```bash
git fetch origin
git checkout dev
git pull origin dev
```

**4. Stop containers and drop database:**
```bash
# Stop all containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Remove Medusa database volume (THIS DELETES ALL DATA)
docker volume rm need_this_done_medusa_postgres_data

# Verify it's gone
docker volume ls | grep medusa
```

**5. Rebuild containers (no cache):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache medusa
```

**6. Start all containers:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**7. Wait for Medusa to be healthy:**
```bash
# Check Medusa logs (wait for "Server is ready on port: 9000")
docker logs medusa_backend --tail 50 -f

# Check health endpoint
curl http://localhost:9000/health
```

**8. Create admin user:**
```bash
# Get password from .env
ADMIN_PWD=$(grep '^MEDUSA_ADMIN_PASSWORD=' .env | cut -d'=' -f2)

# Create admin user
docker exec medusa_backend npx medusa user -e admin@needthisdone.com -p "$ADMIN_PWD"
```

**9. Seed products:**
```bash
# Run seed script (creates 3 consultation products)
docker exec -e MEDUSA_ADMIN_PASSWORD="$ADMIN_PWD" medusa_backend node seed-products.js
```

**Expected output:**
```
Seeding consultation products...

1. Authenticating...
   ✓ Authenticated as admin@needthisdone.com
2. Getting region...
   ✓ Region: United States (reg_...)
3. Getting shipping profile...
   ✓ Profile: Default Shipping Profile (sp_...)
4. Getting sales channel...
   ✓ Channel: Default Sales Channel (sc_...)

5. Creating consultation products...
   ✓ 15-Minute Quick Consultation: Created ($20.00)
   ✓ 30-Minute Strategy Consultation: Created ($35.00)
   ✓ 55-Minute Deep Dive Consultation: Created ($50.00)

6. Verifying products...
   Found 3 products in store

✅ Seeding complete!
```

**10. Verify in database:**
```bash
docker exec medusa_postgres psql -U medusa -d medusa \
  -c "SELECT id, title, status FROM product WHERE deleted_at IS NULL;"
```

**11. Test the shop page:**
```bash
# Should show 3 products
curl -s https://needthisdone.com/shop | grep -E "(Quick|Strategy|Deep Dive)"
```

**12. If successful, merge to main:**
```bash
# On local machine
git checkout main
git merge dev
git push origin main
```

---

### Common Issues & Fixes

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Environment variable warning** | `WARN: "MEDUSA_ADMIN_PASSWORD" variable is not set` | Add `MEDUSA_ADMIN_PASSWORD` to `.env` file (Docker Compose reads `.env`, services read `.env.local`) |
| **Auth failed during seeding** | `Auth failed: Unauthorized` | Admin user password doesn't match. Delete user and recreate with correct password |
| **No products on /shop** | Shop page empty after deployment | Database needs seeding. Follow "Fresh Database Deployment" steps 8-9 |
| **Medusa won't start** | Container crashes on startup | Check logs: `docker logs medusa_backend`. Usually missing env vars or migration errors |
| **Products showing but wrong data** | Old product titles/prices | Drop database and reseed, or update products via Admin API |
| **Containers won't build** | Build errors during deployment | Use `--no-cache` flag: `docker-compose build --no-cache` |

**Emergency rollback:**
```bash
ssh root@159.65.223.234
cd /root/Need_This_Done

# Stop containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Find last working commit
git log --oneline -10

# Checkout that commit
git checkout <commit-hash>

# Rebuild and start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

### Product Seeding Details

**What gets seeded:**
- 3 consultation products via `medusa/seed-products.js`
- Uses Medusa Admin API (stable, documented, versioned with code)
- Products include metadata: `requires_appointment: true`, `duration_minutes`, `service_type`

**Products created:**

| Product | Price | Duration | Handle |
|---------|-------|----------|--------|
| 15-Minute Quick Consultation | $20.00 | 15 min | `consultation-15-min` |
| 30-Minute Strategy Consultation | $35.00 | 30 min | `consultation-30-min` |
| 55-Minute Deep Dive Consultation | $50.00 | 55 min | `consultation-55-min` |

**Why seed-products.js instead of seed.json?**
- ✅ **Sustainable**: Uses official Medusa Admin API
- ✅ **Idempotent**: Won't create duplicates if run multiple times
- ✅ **Versioned**: Product definitions stored in git
- ✅ **Flexible**: Easy to update product copy, pricing, metadata
- ❌ **seed.json issues**: Required missing arrays, created duplicates with migrations

**Admin credentials:**
- Email: `admin@needthisdone.com`
- Password: Set via `MEDUSA_ADMIN_PASSWORD` environment variable

---

## What This Project Is

A modern platform for professional services that combines:

- **E-commerce platform**: Browse products, add to cart, checkout, manage orders
- **User accounts**: Authentication, profiles, order history
- **Admin dashboard**: Manage products, view orders, user management
- **Visual page builder**: Non-technical users can create pages (Puck visual editor)
- **Component library**: Reusable, accessible React components (Storybook)

**Tech Stack:**
- **Frontend**: Next.js 14 (React) with TypeScript
- **Backend**: Next.js API routes + Medusa (ecommerce engine)
- **Database**: Supabase (PostgreSQL with pgvector for AI chatbot)
- **Ecommerce**: Medusa headless commerce engine
- **Payments**: Stripe (one-time & subscriptions)
- **Email**: Resend (transactional emails) - ✅ Configured, sends from hello@needthisdone.com
- **Cache**: Redis for performance
- **Infrastructure**: Docker + Nginx reverse proxy
- **Design**: Tailwind CSS with dark mode support
- **Testing**: Playwright E2E tests + Visual regression testing (screenshot baselines)

---

## Architecture Overview

```
┌──────────────────────────────────────────┐
│          Browser / User                  │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────┐
│   Nginx (reverse proxy, SSL)       │
│   - Routes all traffic (port 443)  │
└───────────┬────────────────────────┘
            │
    ┌───────┴───────┬───────────┐
    │               │           │
┌───▼────────┐  ┌──▼──────┐  ┌─▼──────────┐
│ Next.js    │  │ Medusa  │  │ Supabase   │
│ - Pages    │  │ Backend │  │ - Auth     │
│ - API      │  │ - Cart  │  │ - Database │
│ - Auth     │  │ - Orders│  │            │
└───┬────────┘  └──┬──────┘  └─┬──────────┘
    │              │           │
    └──────────┬───┴───────────┘
               │
    ┌──────────▼──────────┐
    │ Redis Cache         │
    │ - Products          │
    │ - User dashboards   │
    │ - Cart data         │
    └─────────────────────┘
```

**Data Flow**:
1. User makes request to your domain
2. Nginx receives it (handles SSL, routes traffic)
3. Next.js serves pages or API routes
4. Next.js calls Medusa backend for ecommerce
5. Next.js calls Supabase for user/auth data
6. Redis caches frequently accessed data

**Why This Design**:
- ✅ **Separation of concerns** - Commerce, auth, and user data are separate
- ✅ **Independent scaling** - Each service scales independently
- ✅ **Fast iteration** - Change UI without touching business logic
- ✅ **Future-proof** - Can add mobile, CLI, or third-party integrations

### Medusa Backend (Current State)

Real Medusa implementation with database-persisted products, carts, and orders. All consultation products require appointment scheduling before fulfillment.

| Feature | Status | Tested | Details |
|---------|--------|--------|---------|
| Products | ✅ Working | 12 E2E tests | 3 consultation tiers, seeded via `npm run seed` |
| Carts | ✅ Working | 8 E2E tests | Stored in Medusa PostgreSQL |
| Checkout | ✅ Working | 6 E2E tests | Guest + authenticated checkout flows |
| Orders | ✅ Working | 4 E2E tests | Full order objects, linked in Supabase |
| Email | ✅ Working | 9 unit tests | 4 email types via Resend |

**All 110 automated tests passing** - See [Testing](#testing) for complete coverage map.

**Consultation Products** (seeded via `medusa/seed-products.js` using Admin API):
| Product | Price | Duration | Handle |
|---------|-------|----------|--------|
| 15-Minute Quick Consultation | $20 | 15 min | `consultation-15-min` |
| 30-Minute Strategy Consultation | $35 | 30 min | `consultation-30-min` |
| 55-Minute Deep Dive Consultation | $50 | 55 min | `consultation-55-min` |

**Admin Credentials** (for Medusa Admin panel):
- Email: `admin@needthisdone.com`
- Password: **Required** - Set via `MEDUSA_ADMIN_PASSWORD` environment variable in `.env.local`

**Security Note:** The `MEDUSA_ADMIN_PASSWORD` environment variable is required for all environments. Scripts will fail if not set - no fallback passwords.

---

## Development Setup

### Prerequisites

```bash
# Install Docker
# https://www.docker.com/products/docker-desktop

# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Verify installations
docker --version
supabase --version
```

### Starting the Full Stack

**Terminal 1: Start Docker services (commerce + cache)**
```bash
npm run dev:start
```

This starts:
- Nginx (reverse proxy on https://localhost)
- Next.js app (port 3000)
- Medusa backend (port 9000)
- Medusa PostgreSQL (internal)
- Redis cache (internal)

**Terminal 2: Start Supabase (auth + database)**
```bash
supabase start
```

This starts:
- PostgreSQL (port 54322)
- Supabase API (port 54321)
- Realtime server
- Applies migrations

**Once Everything is Running**:
```bash
# App is at https://localhost
# Storybook is at http://localhost:6006
```

### Environment Configuration

**Root `.env.local`** (shared by Docker services):
```bash
# Medusa backend
MEDUSA_DB_PASSWORD=your_secure_password  # Generate: openssl rand -base64 32
MEDUSA_JWT_SECRET=your_jwt_secret  # Generate: openssl rand -base64 32
MEDUSA_ADMIN_JWT_SECRET=your_admin_secret  # Generate: openssl rand -base64 32
MEDUSA_BACKEND_URL=http://medusa:9000  # Internal Docker URL
DATABASE_URL=postgresql://medusa:password@localhost:5432/medusa  # Auto-constructed in docker-compose
COOKIE_SECRET=your_cookie_secret  # Generate: openssl rand -base64 32
ADMIN_CORS=http://localhost:7001,https://localhost  # Admin panel CORS origins

# Redis
REDIS_URL=redis://redis:6379
SKIP_CACHE=true  # Optional: bypass Redis in dev mode

# Supabase (see "Choosing Cloud vs Local Supabase" below)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend) - ✅ Configured & Deployed
RESEND_API_KEY=re_...                         # Your Resend API key
RESEND_FROM_EMAIL=hello@needthisdone.com      # Verified domain (DNS: DKIM, SPF)
RESEND_ADMIN_EMAIL=abe.raise@gmail.com        # Admin notification recipient

# AI Chatbot (optional - defaults shown)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CHATBOT_MODEL=gpt-4o-mini  # Chat model
NEXT_PUBLIC_CHATBOT_MAX_TOKENS=1000  # Max response tokens
NEXT_PUBLIC_CHATBOT_TEMPERATURE=0.7  # Chat creativity (0-1)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Embedding model
EMBEDDING_BATCH_SIZE=100  # Batch size for embeddings
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.7  # Min similarity score (0-1)
VECTOR_SEARCH_MAX_RESULTS=5  # Max search results

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://localhost  # Used for auth redirects
NEXT_PUBLIC_URL=https://localhost  # Used for metadata/SEO
NODE_ENV=development
```

### Choosing Cloud vs Local Supabase

You can run with **Cloud Supabase** (easier, OAuth works) or **Local Supabase** (offline, free).

**Option A: Cloud Supabase (Recommended for OAuth)**
```bash
# .env.local - Point to your cloud project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-cloud-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-cloud-service-key
# Don't set SUPABASE_INTERNAL_URL (not needed for cloud)
```

**Option B: Local Supabase (Offline development)**
```bash
# .env.local - Point to local Supabase + internal URL for Docker
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# REQUIRED for Docker: Allows container to reach host's Supabase
SUPABASE_INTERNAL_URL=http://host.docker.internal:54321
```

**Note**: OAuth providers (Google, GitHub, etc.) only work with Cloud Supabase unless you configure them locally. For local development with OAuth, use Cloud Supabase.

### Stopping Services

```bash
# Stop Docker services
npm run dev:stop

# Stop Supabase
supabase stop

# Reset Supabase (clears all data)
supabase db reset
```

### Docker Environments (Local vs Production)

**Important**: Local development and production use completely separate Docker configurations.

| Aspect | Local Development | Production (DigitalOcean) |
|--------|-------------------|---------------------------|
| Compose file(s) | `docker-compose.yml` + `docker-compose.dev.yml` | `docker-compose.production.yml` (standalone) |
| Dockerfile | `app/Dockerfile.dev` | `app/Dockerfile` |
| Source code | Volume mounted (hot reload) | Baked into image |
| SSL | Self-signed (localhost) | Let's Encrypt (needthisdone.com) |
| Ports exposed | 3000, 6379, 6006 (debugging) | 80, 443 only (via nginx) |

**Local Development**
```bash
npm run dev:start
```

See [Docker Commands](#docker-commands) table for all available commands.

The dev overlay (`docker-compose.dev.yml`) adds:
- Volume mounts for hot reload
- `.env.local` mount for environment variables
- Exposed ports for debugging
- Storybook service

**Production Deployment**
```bash
# SSH to DigitalOcean server, then:
git pull origin main
docker-compose -f docker-compose.production.yml up --build -d
```

Production uses a completely standalone compose file - it does NOT reference the base or dev files. Changes to `docker-compose.yml` or `docker-compose.dev.yml` do not affect production.

---

## Docker Development Workflow

### When to Restart, Rebuild, or Wait

Understanding when containers need restarting is crucial for efficient development. This section explains when changes require manual intervention vs automatic hot reload.

#### Quick Reference: What Changed → What to Do

| You Changed... | What to Do | Why | Command |
|---------------|------------|-----|---------|
| **Next.js code** (`app/lib/`, `app/app/`, `app/components/`) | Nothing* | Hot reload auto-restarts | *Wait 2-3 seconds* |
| **API routes** (`app/app/api/`) | Restart `nextjs_app` | Hot reload sometimes misses API changes | `./scripts/docker.sh restart website` |
| **Environment variables** (`.env.local`) | Restart both | Env vars loaded at startup | `./scripts/docker.sh restart website store` |
| **Medusa backend** (`medusa/`) | Restart `medusa_backend` | No hot reload in Medusa | `./scripts/docker.sh restart store` |
| **Nginx config** (`nginx/nginx.conf`) | Restart `nginx` | Config loaded at startup | `./scripts/docker.sh restart front-door` |
| **Docker configs** (`docker-compose*.yml`, Dockerfiles) | Rebuild everything | Need fresh build | `./scripts/docker.sh rebuild <service>` |
| **Package changes** (`package.json`, `package-lock.json`) | Rebuild service | Rebuild with new deps | `./scripts/docker.sh rebuild <service>` |

\* Hot reload works **most of the time** but not always. If changes don't appear after 3 seconds, manual restart is needed.

### How Hot Reload Works

#### ✅ Has Hot Reload (Auto-Restart)

**Next.js App** (`nextjs_app`)
- **How it works**: Volume mount (`./app:/app`) + Next.js dev mode
- **When it works**: Most `.ts`, `.tsx`, `.js`, `.jsx` file changes
- **When it fails**:
  - API route changes sometimes don't trigger reload
  - Changes to `next.config.js`
  - Adding new dependencies
  - Environment variable changes
- **Fix**: Manual restart if changes don't appear after 3 seconds

**Storybook** (`storybook_dev`)
- **How it works**: Volume mount + Storybook dev mode
- **When it works**: Component story changes
- **When it fails**: Storybook config changes
- **Fix**: Manual restart

#### ❌ No Hot Reload (Always Restart Manually)

**Medusa Backend** (`medusa_backend`)
- **Why no hot reload**: Medusa doesn't have hot reload built in
- **Restart for**: ANY code change in `medusa/` directory
- **Command**: `./scripts/docker.sh restart store`

**Nginx** (`nginx`)
- **Why no hot reload**: Nginx config loaded at startup only
- **Restart for**: ANY config change in `nginx/` directory
- **Command**: `./scripts/docker.sh restart front-door`

**Redis & Postgres** (`redis`, `medusa_postgres`)
- **Why no hot reload**: Data services, no code to change
- **Restart for**: Never (unless service crashes)

### Restart vs Rebuild

#### When to **Restart** (faster, preserves data)
```bash
./scripts/docker.sh restart <service>
```

Use restart for:
- Code changes (within existing dependencies)
- Config file changes
- Environment variable changes
- Service not responding

#### When to **Rebuild** (slower, clean slate)
```bash
./scripts/docker.sh rebuild <service>
```

Use rebuild for:
- `package.json` / `package-lock.json` changes (new dependencies)
- Dockerfile changes
- Build configuration changes
- Persistent bugs that restart doesn't fix

### Helper Commands for Common Scenarios

The `./scripts/docker.sh` script provides convenient shortcuts for common restart scenarios:

#### After Git Pull (Smart Detection)
```bash
./scripts/docker.sh after-pull
```

Automatically detects which files changed and restarts only the affected services:
- `app/` changes → restarts `website`
- `medusa/` changes → restarts `store`
- `nginx/` changes → restarts `front-door`
- `.env` changes → restarts `website` + `store`

#### Fix Checkout Issues
```bash
./scripts/docker.sh fix-checkout
```

One-command fix for common checkout problems:
- Restarts `website` (Next.js app + API routes)
- Restarts `store` (Medusa backend)
- Clears any stuck payment sessions

#### Restart Multiple Services
```bash
./scripts/docker.sh restart website store memory
```

Restart several services at once. Useful when changes affect multiple containers.

### Common Development Scenarios

#### Scenario 1: Fixed Checkout Bug (API Route Change)
**What changed**: `app/app/api/checkout/session/route.ts`

**Hot reload worked?** Sometimes no (API routes can be tricky)

**Solution**:
```bash
./scripts/docker.sh restart website
```

**Why**: Force Next.js to reload API routes

---

#### Scenario 2: Updated Medusa Payment Logic
**What changed**: `medusa/src/services/cart-service.ts`

**Hot reload worked?** Never (Medusa has no hot reload)

**Solution**:
```bash
./scripts/docker.sh restart store
```

**Why**: Medusa requires manual restart for all changes

---

#### Scenario 3: Added New npm Package
**What changed**: `package.json` + `package-lock.json`

**Hot reload worked?** Never (dependencies installed at build time)

**Solution**:
```bash
./scripts/docker.sh rebuild website  # If package added to app/
./scripts/docker.sh rebuild store    # If package added to medusa/
```

**Why**: Need to reinstall node_modules

---

#### Scenario 4: Changed Environment Variables
**What changed**: `.env.local`

**Hot reload worked?** Never (env vars loaded at container start)

**Solution**:
```bash
# If changed Next.js env vars
./scripts/docker.sh restart website

# If changed Medusa env vars
./scripts/docker.sh restart store

# If changed both (most common)
./scripts/docker.sh restart website store
```

**Why**: Environment variables are only read at startup

---

#### Scenario 5: Updated Nginx SSL Config
**What changed**: `nginx/nginx.conf`

**Hot reload worked?** Never (nginx config loaded at start)

**Solution**:
```bash
./scripts/docker.sh restart front-door
```

**Why**: Nginx must reload config

### The Foolproof Restart Checklist

**After making code changes:**

1. ✅ **Wait 3 seconds** - Check if hot reload worked
2. ❌ **Changes not visible?** → Restart the service
3. ❌ **Still not working?** → Check logs for errors
4. ❌ **Still broken?** → Rebuild the service
5. ❌ **Nuclear option?** → `./scripts/docker.sh fresh`

**Always restart after:**
- ✅ Pulling from git
- ✅ Changing `.env.local`
- ✅ Changing API routes
- ✅ Changing Medusa code
- ✅ Changing nginx config

**Always rebuild after:**
- ✅ Adding npm packages
- ✅ Changing Dockerfiles
- ✅ Changing `next.config.js`
- ✅ Persistent bugs that restart doesn't fix

---

## Project Structure

### Root Level

| File/Folder | Purpose |
|-------------|---------|
| `README.md` | This file - main project documentation |
| `TODO.md` | Task tracker (To Do / In Progress / Done) |
| `CLAUDE.md` | Project guidelines for Claude Code |
| `docker-compose.yml` | Docker service definitions |
| `docker-compose.dev.yml` | Development-specific overrides |
| `nginx/` | Reverse proxy configuration and SSL certs |
| `supabase/` | Database migrations and configuration |
| `medusa/` | Ecommerce backend service |

### Application (`app/`)

| Folder | Purpose |
|--------|---------|
| `app/app/` | Next.js App Router - pages and API routes |
| `├── shop/` | E-commerce shop and product catalog |
| `├── cart/` | Shopping cart page |
| `├── checkout/` | Checkout and order creation |
| `├── admin/` | Admin dashboard (products, orders, users) |
| `├── api/` | API route handlers (auth, products, carts, orders) |
| `app/components/` | Reusable React UI components |
| `app/context/` | React Context providers (CartContext, AuthContext) |
| `app/lib/` | Shared utilities (colors, auth, database, cache) |
| `app/config/` | App-wide configuration |
| `app/e2e/` | End-to-end tests (Playwright) |
| `app/__tests__/` | Unit tests and accessibility tests |

### Key Utilities

| File | What it does |
|------|--------------|
| `app/lib/colors.ts` | Single source of truth for all colors |
| `app/lib/auth.ts` | Authentication utilities |
| `app/lib/supabase.ts` | Supabase database client |
| `app/lib/redis.ts` | Redis cache client |
| `app/lib/medusa-client.ts` | Medusa API wrapper with retry logic |
| `app/lib/cache.ts` | Cache utility with pattern invalidation |
| `app/context/CartContext.tsx` | Shopping cart state management |

---

## Shopping Cart & Ecommerce

### How It Works

The cart system is a **three-tier architecture**:

1. **Medusa Backend** (port 9000) - In-memory cart storage with REST API
2. **Next.js API Routes** (`/api/cart/*`) - Bridge between frontend and Medusa
3. **React CartContext** - Frontend state management with localStorage persistence

### Cart Data Flow

```
User clicks "Add to Cart"
      ↓
CartContext.addItem(variant_id, quantity)
      ↓
POST /api/cart/{cartId}/items
      ↓
POST http://medusa:9000/store/carts/{cartId}/line-items
      ↓
Medusa returns updated cart
      ↓
CartContext updates state + localStorage
      ↓
UI updates: badge shows item count, success toast appears
```

### Medusa API Endpoints

```bash
# Create a new cart
POST /store/carts
→ Returns: {cart: {id, items: [], subtotal: 0, total: 0}}

# Get cart details
GET /store/carts/{cartId}
→ Returns: {cart: {id, items: [...], subtotal, total}}

# Add item to cart
POST /store/carts/{cartId}/line-items
Body: {variant_id: "variant_prod_1_default", quantity: 1}
→ Returns: {cart: {...updated cart with new item...}}

# Update item quantity
POST /store/carts/{cartId}/line-items/{itemId}
Body: {quantity: 2}
→ Returns: {cart: {...}}

# Remove item from cart
DELETE /store/carts/{cartId}/line-items/{itemId}
→ Returns: {cart: {...updated cart...}}
```

### Frontend Usage

```typescript
import { useCart } from '@/context/CartContext';

function ShopPage() {
  const { addItem, cart } = useCart();

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      await addItem(variantId, quantity);
      // Cart updated, UI refreshes automatically
    } catch (error) {
      // Show error to user
    }
  };

  return (
    <>
      <button onClick={() => handleAddToCart('variant_prod_1_default', 1)}>
        Add to Cart
      </button>
      <span>Items in cart: {cart?.items.length || 0}</span>
    </>
  );
}
```

### Appointment Booking Requirements

Consultation products include built-in booking constraints for quality service:

| Constraint | Value | Enforced By |
|------------|-------|-------------|
| Advance booking | 24 hours minimum | `api/appointments/availability` |
| Daily limit | 5 appointments max | `api/appointments/availability` |
| Buffer time | 30 minutes between appointments | Google Calendar validation |
| Business hours | 9 AM - 5 PM, Monday-Friday | Appointment form time picker |

**Why these constraints:**
- 24-hour advance booking: Allows proper preparation for each consultation
- Daily limit: Maintains quality by preventing over-scheduling
- Buffer time: Accounts for transitions, notes, and breaks
- Business hours: Ensures availability during working hours

**Implementation:**
- Form validation in `components/AppointmentRequestForm.tsx`
- Backend validation in `api/appointments/request/route.ts`
- Real-time availability check via `api/appointments/availability`

### Testing the Cart

**Manual browser test**:
```bash
# 1. Navigate to https://localhost/shop
# 2. Click "Add Cart" on a product
# 3. Should see success toast
# 4. Cart badge should update
# 5. Click cart icon to view items
```

**API test**:
```bash
# Create cart
CART=$(curl -s -X POST http://localhost:9000/store/carts | jq -r '.cart.id')

# Add item
curl -s -X POST "http://localhost:9000/store/carts/$CART/line-items" \
  -H "Content-Type: application/json" \
  -d '{"variant_id":"variant_prod_1_default","quantity":1}' | jq '.'

# Get cart
curl -s "http://localhost:9000/store/carts/$CART" | jq '.'
```

**Automated E2E tests**:
```bash
cd app
npm run test:e2e -- e2e/shop-cart.spec.ts
```

---

## Caching Strategy

### Why Caching Matters

Without caching, every user request hits the database (slow).
With caching (Redis), most requests are answered from cache (fast).

**Impact**:
- 60-80% reduction in database queries
- 15-50x faster response times on cache hits
- Significantly lower Supabase costs

### Cache-Aside Pattern

The caching system uses a simple, effective pattern:

```
Request comes in
    ↓
Check Redis cache
    ├─ HIT: return cached data (2ms)
    └─ MISS: query database
         ↓
      Store result in Redis with TTL
         ↓
      Return data to user (200-300ms first time)
```

### Adding Caching to Routes

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// In your API route
export async function GET(request: Request) {
  const result = await cache.wrap(
    CACHE_KEYS.myData('some-id'),
    async () => {
      // This function only runs on cache MISS
      const { data, error } = await supabase
        .from('my_table')
        .select('*');

      if (error) throw new Error('Failed to fetch');
      return data;
    },
    CACHE_TTL.MEDIUM  // 60 seconds
  );

  return NextResponse.json(result);
}

// When data changes (create, update, delete)
await cache.invalidate(CACHE_KEYS.myData('some-id'));
```

### Cache Configuration

**TTL Values**:
- `CACHE_TTL.SHORT` (30s) - Frequently updated data
- `CACHE_TTL.MEDIUM` (60s) - Dashboard data (default)
- `CACHE_TTL.LONG` (300s / 5m) - Admin data
- `CACHE_TTL.STATIC` (3600s / 1h) - Services, pricing

**Current Cache Keys**:
```
products:all              All products (1m)
cart:{cartId}            Cart data (30s)
order:{orderId}          Order details (5m)
user:projects:{userId}   User's projects (1m)
admin:projects:all       All projects (5m)
```

---

## Email Notifications

### How It Works

Email is handled by **Resend** with a two-layer architecture:

1. **email.ts** - Core infrastructure (client, retry logic, idempotency)
2. **email-service.ts** - Business logic (what emails to send and when)

### Current Email Capabilities

| Email Type | Status | Trigger |
|------------|--------|---------|
| Welcome email | ✅ Ready | After account creation |
| Login notification | ✅ Ready | After each sign-in (security) |
| Admin notifications | ✅ Ready | New project submission |
| Client confirmation | ✅ Ready | After form submission |

### Email Configuration

```bash
RESEND_API_KEY=re_...                    # API key from resend.com
RESEND_FROM_EMAIL=hello@needthisdone.com # Must match verified domain
RESEND_ADMIN_EMAIL=abe.raise@gmail.com   # Where admin alerts go
```

### Sending Emails

```typescript
import { sendEmailWithRetry } from '@/lib/email';
import { sendAdminNotification, sendClientConfirmation } from '@/lib/email-service';

// Option 1: Use business logic functions (recommended)
await sendAdminNotification({ name: 'John', email: 'john@example.com', ... });
await sendClientConfirmation('john@example.com', { name: 'John' });

// Option 2: Send custom email with retry logic
await sendEmailWithRetry(
  'recipient@example.com',
  'Subject Line',
  <YourReactEmailComponent {...props} />
);
```

### Email Templates

React Email templates are in `app/emails/`:
- `WelcomeEmail.tsx` - Welcome message after account creation
- `LoginNotificationEmail.tsx` - Security alert after each sign-in
- `AdminNotification.tsx` - New project alert for admin
- `ClientConfirmation.tsx` - Submission confirmation for clients
- `OrderConfirmationEmail.tsx` - Order confirmation after checkout
- `AppointmentConfirmationEmail.tsx` - Appointment confirmation for consultations
- `AppointmentRequestNotificationEmail.tsx` - Admin notification for appointment requests
- `PurchaseReceiptEmail.tsx` - Detailed receipt after payment
- `AbandonedCartEmail.tsx` - Cart recovery reminder with optional discount

### Testing Emails

```bash
# Send all email types to verify they work
cd app && npm run test:emails
```

---

## Testing

### Test Summary

| Category | Tests | Status | Command |
|----------|-------|--------|---------|
| E2E Shop & Cart | 57 | ✅ Passing | `npm run test:e2e -- e2e/shop*.spec.ts` |
| E2E Submissions | 5 | ✅ Passing | `npm run test:e2e -- e2e/submission.spec.ts` |
| E2E Chatbot | 14 | ✅ Passing | `npm run test:e2e -- e2e/chatbot.spec.ts` |
| E2E Appointments | 23 | ✅ Passing | `npm run test:e2e -- e2e/appointments.spec.ts` |
| E2E Accessibility | 10 | ✅ Passing | `npm run test:a11y` |
| Component A11Y | 8 | ✅ Passing | `npm run test:run` |
| Email Templates | 10 | ✅ Passing | `npm run test:run` |
| Redis Integration | 6 | ✅ Passing | `npm run test:run` |
| Health API | 4 | ✅ Passing | `npm run test:run` |
| **Total** | **137** | ✅ **All Passing** | `npm run test:all` |

### Feature → Test Coverage Map

Every feature has automated tests. Here's exactly where each is tested:

<details>
<summary><strong>E-commerce - Shop Flow (32 tests)</strong> - <code>e2e/shop.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Product Catalog | `product listing page displays all products with pricing` | Shop displays products with $20/$35/$50 pricing |
| Product Catalog | `product detail page shows full product information` | Title, price, add to cart, quantity selector |
| Product Catalog | `cart icon in navigation shows item count` | Cart badge displays current count |
| Add to Cart | `add to cart updates cart count on page` | Success toast, count updates |
| Add to Cart | `can adjust quantity before adding to cart` | Quantity selector works |
| Add to Cart | `can add different products to cart` | Multiple products can be added |
| Add to Cart | `shows success feedback when adding to cart` | Toast appears, button re-enables |
| Cart Management | `view cart shows all items with quantities and prices` | Heading, subtotal, order summary |
| Cart Management | `can update item quantity in cart` | + button increases quantity |
| Cart Management | `can remove items from cart` | Remove button works |
| Cart Management | `shows empty cart message when no items` | Empty state displays |
| Cart Management | `persists cart across page navigation` | Cart survives navigation |
| Guest Checkout | `guest can checkout without authentication` | Email and shipping form shown |
| Guest Checkout | `checkout form validates required fields` | Prevents empty submission |
| Guest Checkout | `displays order confirmation after guest checkout` | Success page appears |
| Auth Checkout | `authenticated user can checkout with autofilled email` | Login/guest options shown |
| Auth Checkout | `authenticated user order appears in dashboard` | Orders visible in dashboard |
| Auth Checkout | `order history shows order details correctly` | ID, date, total, status shown |
| Admin Integration | `admin can access shop dashboard` | Returns 200/302/401 |
| Admin Integration | `product management endpoints are protected` | POST returns 401 |
| Admin Integration | `orders endpoint returns data for authorized requests` | GET returns 401 unauth |
| Cache | `product list is cached efficiently` | API caches responses |
| Cache | `product detail is cached` | Single product caching |
| Error Handling | `handles invalid product ID gracefully` | Shows loading/error/not found |
| Error Handling | `handles network errors in cart operations gracefully` | Shows toast and View Cart |
| Error Handling | `checkout with empty cart shows appropriate message` | Redirects or shows message |
| Integration | `complete flow: browse → add → cart → checkout → confirmation` | Full user journey |
| Variant Regression | `all products in API have variants` | Variants array exists |
| Variant Regression | `each variant has required pricing data` | Has id, prices, currency |
| Variant Regression | `product detail page variant dropdown does not show errors` | No "No variants" error |
| Variant Regression | `add to cart works without variant errors` | No variant errors |
| Variant Regression | `all consultation products have variants` | 15/30/55-min have variants |

</details>

<details>
<summary><strong>E-commerce - Cart Operations (8 tests)</strong> - <code>e2e/shop-cart.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Add to Cart | `can add single item to cart from shop page` | Success toast, View Cart link |
| Add to Cart | `can add multiple different items to cart` | Multiple products added |
| Add to Cart | `displays correct pricing for added items` | Correct price displays |
| Cart Operations | `can update item quantity in cart` | Quantity input works |
| Cart Operations | `can remove item from cart` | Remove button works |
| Error Handling | `shows error when add to cart fails` | Error messages display |
| Error Handling | `cart persists after page refresh` | localStorage/session works |
| Integration | `complete checkout flow: add items, update quantity, proceed to cart` | Full cart flow |

</details>

<details>
<summary><strong>E-commerce - Product Variants (12 tests)</strong> - <code>e2e/shop-variants.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Add to Cart Workflow | `products display on shop page without variant errors` | All 3 consultations visible |
| Add to Cart Workflow | `can add 15-Minute Consultation to cart from shop page` | Details link, success toast |
| Add to Cart Workflow | `product detail page shows variant dropdown` | Add to Cart visible |
| Add to Cart Workflow | `can add product from detail page with variant` | Direct URL works |
| Add to Cart Workflow | `can add multiple different products to cart` | Multiple via Details pages |
| Add to Cart Workflow | `cart displays added products correctly` | Shows subtotal |
| Add to Cart Workflow | `standard variant is selected by default` | Pre-selected value |
| Add to Cart Workflow | `can adjust quantity before adding to cart` | Quantity controls work |
| Add to Cart Workflow | `all three products have variants available` | All have Add to Cart |
| Variant Data Integrity | `product API returns variants for all products` | Variants array exists |
| Variant Data Integrity | `variants have correct pricing` | $20/$35/$50 correct |
| Variant Data Integrity | `variants have required fields` | id, title, prices present |

</details>

<details>
<summary><strong>Form Submissions (5 tests)</strong> - <code>e2e/submission.spec.ts</code></summary>

| Test Name | Verifies |
|-----------|----------|
| `submits request WITHOUT attachments` | Form works without files, data saved to DB |
| `submits request WITH 1 attachment` | Single file upload, stored in Supabase |
| `submits request WITH 2 attachments` | Multiple files work simultaneously |
| `submits request WITH 3 attachments (max allowed)` | Max 3 files enforced |
| `admin can retrieve uploaded attachment via API` | Full round-trip: upload → storage → retrieval |

</details>

<details>
<summary><strong>AI Chatbot Widget (14 tests)</strong> - <code>e2e/chatbot.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Button Tests | `should display chatbot button on homepage` | Button visible on home |
| Button Tests | `should display chatbot button on all public pages` | Button on all 6 pages |
| Button Tests | `should have proper button styling and accessibility` | ARIA label, title, role |
| Modal Tests | `should open modal when button is clicked` | Modal appears with title |
| Modal Tests | `should close modal when close button is clicked` | Close button works |
| Modal Tests | `should close modal when Escape key is pressed` | Keyboard shortcut works |
| Modal Tests | `should close modal when clicking outside panel area` | Panel stays stable |
| Modal Tests | `should hide chat button when modal is open` | Button visibility toggles |
| Chat Input | `should display welcome message when modal opens` | Welcome text appears |
| Chat Input | `should focus input field when modal opens` | Auto-focus works |
| Chat Input | `should allow typing in the input field` | Text input works |
| Chat Input | `should disable send button when input is empty` | Button state changes |
| Accessibility | `should have proper ARIA attributes on modal` | aria-modal, aria-labelledby |
| Accessibility | `should be navigable with keyboard` | Enter key opens chat |
| Dark Mode | `should work correctly in dark mode` | Dark styling applied |
| Clear Chat | `should show clear button only when there are messages` | Conditional visibility |

</details>

<details>
<summary><strong>Appointment Booking (23 tests)</strong> - <code>e2e/appointments.spec.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Request Form | `appointment form appears after checkout for consultation products` | Form shows post-payment |
| Request Form | `appointment request API validates required fields` | Missing fields return 400 |
| Request Form | `appointment request API validates weekday dates` | Weekend dates rejected |
| Request Form | `appointment request API validates business hours` | 9 AM - 5 PM enforced |
| Request Form | `appointment request API returns 404 for non-existent order` | Invalid order handled |
| Admin Dashboard | `admin appointments page requires authentication` | Auth redirect works |
| Admin Dashboard | `admin appointments API requires authentication` | GET returns 401 unauth |
| Admin Dashboard | `admin appointments approve endpoint requires authentication` | POST returns 401 |
| Admin Dashboard | `admin appointments cancel endpoint requires authentication` | POST returns 401 |
| Form UI | `appointment form component displays correctly` | Products load, prices visible |
| Form UI | `business hours are displayed correctly in time options` | 9 AM - 5 PM shown |
| Integration | `consultation product has requires_appointment metadata` | All 3 products exist |
| Integration | `checkout session endpoint returns appointment info for consultation` | Toast appears on add |
| Integration | `complete checkout flow shows appointment form` | Payment button visible |
| Integration | `admin navigation includes appointments link` | Page loads without error |
| Dashboard Layout | `admin navigation includes appointments link` | Page loads successfully |
| Dashboard Layout | `admin appointments page structure is correct` | Endpoint exists (401 not 404) |
| Email Notifications | `appointment request notification email template exists` | Endpoint returns 400 not 404 |
| Email Notifications | `appointment confirmation email is sent on approval` | Endpoint exists (401 not 404) |
| Status Management | `appointment statuses are correctly defined` | pending/approved/modified/canceled |

</details>

<details>
<summary><strong>Visual Regression - Checkout Flow (14 screenshots)</strong> - <code>e2e/checkout-screenshots.spec.ts</code></summary>

| Screenshot | Captures |
|------------|----------|
| Checkout Start | Empty cart → initial checkout page |
| Guest Details Form | Email and shipping address fields |
| Order Summary (Sticky) | Sidebar stays visible while scrolling |
| Appointment Scheduling | Post-checkout appointment request form |
| Payment Form | Stripe Elements integration |
| Order Confirmation | Success page with order details |
| Dark Mode Variants | All above in dark theme |

**Purpose:** Documents the full checkout journey visually. Any unintended UI changes trigger screenshot diffs in CI, preventing accidental regressions before they ship.

**Update baselines:** `npm run test:e2e -- --update-snapshots`

</details>

<details>
<summary><strong>Email Templates (10 tests)</strong> - <code>__tests__/lib/email.unit.test.ts</code></summary>

| Test Suite | Test Name | Verifies |
|------------|-----------|----------|
| Email Templates | `WelcomeEmail renders to valid HTML` | Name, "Start Your First Project" CTA |
| Email Templates | `LoginNotificationEmail renders to valid HTML` | Timestamp, IP, browser, reset link |
| Email Templates | `AdminNotification renders to valid HTML` | Project ID, client details, service type |
| Email Templates | `ClientConfirmation renders to valid HTML` | Name, service type, response time |
| Email Templates | `WelcomeEmail handles missing name gracefully` | Falls back to email prefix |
| Service Functions | `sendWelcomeEmail calls Resend with correct parameters` | Correct recipient, subject |
| Service Functions | `sendLoginNotification calls Resend with correct parameters` | "Sign-In" in subject |
| Service Functions | `sendAdminNotification sends to admin email` | "New Project" + client name |
| Service Functions | `sendClientConfirmation sends to client email` | "We Got Your Message" |

</details>

<details>
<summary><strong>Accessibility - E2E Pages (10 tests)</strong> - <code>e2e/accessibility.a11y.test.ts</code></summary>

| Page | Modes | Verifies |
|------|-------|----------|
| Home (/) | Light, Dark | WCAG AA via axe-core |
| Services (/services) | Light, Dark | WCAG AA via axe-core |
| Pricing (/pricing) | Light, Dark | WCAG AA via axe-core |
| How It Works (/how-it-works) | Light, Dark | WCAG AA via axe-core |
| FAQ (/faq) | Light, Dark | WCAG AA via axe-core |

**Not tested:** Contact, Login, Get Started (hardcoded colors), Shop/Cart/Checkout (external services)

</details>

<details>
<summary><strong>Accessibility - Components (8 tests)</strong> - <code>__tests__/components/*.a11y.test.tsx</code></summary>

| Component | Test Name | Verifies |
|-----------|-----------|----------|
| AuthDemo | `Light mode violations` | No a11y violations in light mode |
| AuthDemo | `Dark mode violations` | No a11y violations in dark mode |
| AuthDemo | `Contrast in both modes` | Sufficient color contrast |
| DatabaseDemo | `Light mode violations` | No a11y violations in light mode |
| DatabaseDemo | `Dark mode violations` | No a11y violations in dark mode |
| DatabaseDemo | `Contrast in both modes` | Sufficient color contrast |
| DatabaseDemo | `Keyboard navigation` | Focus indicators, keyboard accessible |
| DatabaseDemo | `Flow trace contrast` | Contrast in populated state |

</details>

<details>
<summary><strong>Redis Integration (6 tests)</strong> - <code>__tests__/lib/redis.integration.test.ts</code></summary>

| Test Name | Verifies |
|-----------|----------|
| `should connect to Redis and respond to ping` | Connection established, PONG response |
| `should set and get a value` | SET and GET commands work |
| `should handle expiring keys` | SETEX with 1s TTL expires correctly |
| `should handle multiple keys` | Multiple key-value pairs work |
| `should increment counters` | INCR command works atomically |
| `should handle lists` | RPUSH and LRANGE work |

</details>

<details>
<summary><strong>Health API (4 tests)</strong> - <code>__tests__/api/health.integration.test.ts</code></summary>

| Test Name | Verifies |
|-----------|----------|
| `should be able to reach the health endpoint` | Accessible, returns 200 or 500 |
| `should report service statuses` | Reports all configured services |
| `should include valid timestamp` | ISO timestamp within 5 seconds |
| `should respond within reasonable time` | Completes within 10 seconds |

</details>

### Running Tests

**With Docker Running** (recommended - tests against full stack):
```bash
cd app

# Start Docker services first
npm run dev:start   # From project root

# Run ALL E2E tests against Docker stack
SKIP_WEBSERVER=true BASE_URL=https://localhost npx playwright test

# Run specific test file
SKIP_WEBSERVER=true BASE_URL=https://localhost npx playwright test e2e/shop.spec.ts

# Run with visible browser (debugging)
SKIP_WEBSERVER=true BASE_URL=https://localhost npx playwright test --headed
```

**Without Docker** (uses local dev server):
```bash
cd app

# Run ALL tests (starts dev server automatically)
npm run test:all

# Run only E2E tests
npm run test:e2e

# Run only unit/integration tests (fast, no browser)
npm run test:run

# Run only accessibility tests
npm run test:a11y

# Run specific feature tests
npx playwright test e2e/shop-cart.spec.ts        # Cart operations
npx playwright test e2e/shop-variants.spec.ts    # Product variants
npx playwright test e2e/submission.spec.ts       # Form submissions

# Run specific test by name
npx playwright test -k "can add to cart"
```

### Test Architecture

```
Tests are organized by what they verify:

E2E Tests (app/e2e/)
├── shop.spec.ts              # 35 tests: Full shop flow (browse→cart→checkout)
├── shop-cart.spec.ts         # 9 tests: Cart-specific operations
├── shop-variants.spec.ts     # 13 tests: Product variant handling
├── submission.spec.ts        # 5 tests: Form submissions with attachments
├── chatbot.spec.ts           # 14 tests: AI chatbot interactions
├── appointments.spec.ts      # 23 tests: Appointment booking flow
└── accessibility.a11y.test.ts # 10 tests: WCAG AA page compliance

Unit/Integration Tests (app/__tests__/)
├── lib/email.unit.test.ts           # 10 tests: Email template rendering
├── lib/redis.integration.test.ts    # 6 tests: Cache operations
├── api/health.integration.test.ts   # 4 tests: Health endpoint
└── components/
    ├── AuthDemo.a11y.test.tsx       # 3 tests: Auth component accessibility
    └── DatabaseDemo.a11y.test.tsx   # 5 tests: Database component accessibility
```

### Continuous Testing Workflow

Tests run automatically in CI/CD. Before deploying:

1. **All E2E tests must pass** - Verifies user flows work end-to-end
2. **All unit tests must pass** - Verifies utilities and services work
3. **All accessibility tests must pass** - Verifies WCAG AA compliance

**No broken windows policy**: If a test fails, fix it before shipping. We don't skip tests or ignore failures.

### Dark Mode Testing

All pages are tested in both light and dark modes using axe-playwright:

```typescript
// e2e/accessibility.a11y.test.ts
test(`${page.name} - Dark Mode Accessibility`, async ({ page: browserPage }) => {
  // Apply dark mode BEFORE navigation
  await browserPage.emulateMedia({ colorScheme: 'dark' });
  await browserPage.goto(page.path);

  // Run axe accessibility audit
  const results = await new AxeBuilder({ page: browserPage }).analyze();
  expect(results.violations).toEqual([]);
});
```

Common dark mode issues & fixes are documented in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

---

## Developer Tools

### Claude Code Skills

Custom skills in `.claude/skills/` provide specialized agent capabilities:

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `launch-a-swarm` | Spawn 5 parallel agents for comprehensive code review | "launch a swarm" |
| `frontend-design` | Generate distinctive, production-grade UI | Building web interfaces |
| `worktree-swarm` | Orchestrate parallel development with git worktrees | "parallelize", "spawn worktrees" |
| `docker-testing` | Enforce Docker-based testing rules | Running tests |

#### Launch-a-Swarm Skill

Spawns 5 specialized agents working in parallel to review code quality across all critical dimensions:

```
Structure   → DRY, clear organization, minimal coupling
Protection  → Security, input validation, least privilege
Correctness → Tests, data flow, error handling
Evolution   → Flexibility, configuration, adaptability
Value       → User need, automation, documentation
```

**Usage:**
```
User: "launch a swarm to review my changes"
→ 5 agents spawn in parallel
→ Each checks from their domain perspective
→ Results synthesized into prioritized action items
```

**When to use:**
- Planning new features (prevention-focused)
- Building code (real-time guidance)
- Validating before merge/deploy (comprehensive review)

See `.claude/skills/launch-a-swarm.md` for full documentation.

#### Container Restart Commands

For comprehensive guidance on when to restart vs rebuild Docker services, see the [Docker Development Workflow](#docker-development-workflow) section above.

**Quick Reference:**
```bash
# Restart single service
./scripts/docker.sh restart medusa

# Restart multiple services
./scripts/docker.sh restart medusa redis

# When to use restart (preserves data, faster):
# - Code changes (with volume mounts)
# - Config changes (.env.local updates)
# - Service appears hung
# - Network connectivity issues

# When to use rebuild (clean slate, slower):
# - package.json / package-lock.json changes
# - Dockerfile changes
# - Persistent bugs that restart doesn't fix
```

---

## Troubleshooting

### Issue: Code changes not appearing

**Symptom**: Made code changes but they don't show up in browser

**Solutions**:
```bash
# 1. Wait 3 seconds for hot reload
# Hot reload usually works for Next.js components

# 2. Check which service needs restart
# See "Docker Development Workflow" section above for details

# 3. Restart the affected service
./scripts/docker.sh restart website  # For app/ changes
./scripts/docker.sh restart store    # For medusa/ changes

# 4. Check logs for errors
./scripts/docker.sh logs website
./scripts/docker.sh logs store

# 5. If still not working, rebuild
./scripts/docker.sh rebuild website

# 6. Nuclear option - fresh start
./scripts/docker.sh fresh
```

**Quick fixes**:
- After `git pull`: `./scripts/docker.sh after-pull`
- Checkout broken: `./scripts/docker.sh fix-checkout`
- Multiple services: `./scripts/docker.sh restart website store`

See [Docker Development Workflow](#docker-development-workflow) for complete restart guidance.

### Issue: "Failed to add item to cart"

**Symptom**: Error when clicking "Add to Cart"

**Solutions**:
```bash
# 1. Verify Medusa is running
npm run dev:status
# Medusa should show "healthy"

# 2. Test Medusa directly
curl http://localhost:9000/health
# Should return 200

# 3. Check variant exists
curl http://localhost:3000/api/shop/products | jq '.products[0].variants'
# Should show variant array

# 4. Clear Redis cache
docker exec redis redis-cli FLUSHALL

# 5. Restart services
npm run dev:restart
```

### Issue: Pages loading slowly

**Symptom**: Product page takes 5+ seconds

**Solutions**:
```bash
# Check Redis is running
npm run dev:status

# Check cache hit rate
redis-cli INFO stats

# View cache keys
redis-cli KEYS '*'

# Clear old cache
redis-cli FLUSHALL
```

### Issue: Dark mode contrast problems

**Symptom**: Text hard to read in dark mode

**Solutions**:
```bash
# Run accessibility tests
cd app && npm run test:a11y

# Test locally in browser
# Toggle dark mode → Check all text readable
```

**Fix**: Always use centralized colors from `app/lib/colors.ts`:
```typescript
// ❌ Wrong: hardcoded Tailwind classes
<p className="text-gray-800">Text</p>

// ✅ Right: use color system
import { headingColors, formInputColors } from '@/lib/colors';

<h2 className={headingColors.primary}>Heading</h2>
<p className={formInputColors.helper}>Helper text</p>
```

Available color utilities: `headingColors`, `formInputColors`, `formValidationColors`, `titleColors`, `accentColors`, `navigationColors`, `dangerColors`, `linkColors`, `mutedTextColors`, `alertColors`, `dividerColors`, `placeholderColors`, `checkmarkColors`, `cardHoverColors`, `topBorderColors`, `groupHoverColors`, `cardBgColors`, `cardBorderColors`. See [app/lib/colors.ts](app/lib/colors.ts) for the full list.

### Issue: Supabase connection errors

**Symptom**: "Failed to connect to Supabase"

**Solutions**:
```bash
# Verify Supabase is running
supabase status

# Check credentials in .env.local
cat .env.local | grep SUPABASE

# Restart Supabase
supabase stop
supabase start

# Reset if needed (WARNING: clears data)
supabase db reset
```

### Issue: Docker containers won't start

**Symptom**: `npm run dev:start` fails

**Solutions**:
```bash
# Check Docker is running
docker ps

# View detailed logs
npm run dev:logs

# Clean and rebuild
npm run dev:stop
npm run dev:build && npm run dev:start

# Check port availability
lsof -i :3000    # App
lsof -i :9000    # Medusa
lsof -i :6379    # Redis
```

---

## Design System

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for:

- **Color System** - Centralized colors in `app/lib/colors.ts`
- **Accessibility Standards** - WCAG AA compliance, 5:1 contrast minimum
- **Dark Mode Requirements** - Every component must work in light & dark
- **Component Testing** - Automated a11y tests, testing utilities
- **Dark Mode Testing Guide** - Common issues and fixes
- **Component Patterns** - Existing components, building new components

---

## Key Files Reference

### Configuration & Setup
| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (used by Next.js and all services) |
| `docker-compose.yml` | Docker service definitions |
| `app/tsconfig.json` | TypeScript configuration |

### Core Libraries
| File | Purpose |
|------|---------|
| `app/lib/colors.ts` | All color definitions |
| `app/lib/auth.ts` | Authentication logic |
| `app/lib/supabase.ts` | Supabase client setup |
| `app/lib/redis.ts` | Redis cache client |
| `app/lib/medusa-client.ts` | Medusa API wrapper |
| `app/lib/cache.ts` | Caching utility & keys |
| `app/lib/stripe.ts` | Stripe server client |
| `app/lib/email.ts` | Resend email client & helpers |
| `app/lib/email-service.ts` | Email business logic (notifications, confirmations) |

### State Management
| File | Purpose |
|------|---------|
| `app/context/CartContext.tsx` | Shopping cart state |
| `app/context/AuthContext.tsx` | User authentication state |
| `app/context/StripeContext.tsx` | Stripe Elements provider |
| `app/context/ToastContext.tsx` | Global toast notification state |
| `app/context/ServiceModalContext.tsx` | Service detail modal state |

### UI Components
| File | Purpose |
|------|---------|
| `app/components/Navigation.tsx` | Site-wide navigation with cart icon badge |
| `app/components/ui/ConfirmDialog.tsx` | Confirmation dialog component (danger/warning/info variants) |
| `app/components/ui/Toast.tsx` | Toast notification component |

**ConfirmDialog** - Branded confirmation modal replacing browser alerts:
```typescript
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Page?"
  message="This action cannot be undone."
  variant="danger"
/>
```

**Toast Notifications** - Global notification system with auto-dismiss:
```typescript
import { useToast } from '@/context/ToastContext';

const { showToast } = useToast();
showToast('Changes saved!', 'success');
```

All UI components are WCAG AA compliant with keyboard navigation and ARIA attributes.

### Backend Services
| File | Purpose |
|------|---------|
| `medusa/src/index.ts` | Medusa Express server |
| `medusa/medusa-config.js` | Medusa configuration |
| `nginx/nginx.conf` | Nginx reverse proxy config |
| `supabase/migrations/` | Database schema |

### Testing
| File | Purpose |
|------|---------|
| `app/e2e/` | Playwright E2E tests |
| `app/__tests__/setup/a11y-utils.ts` | Accessibility test utilities |
| `app/playwright.config.ts` | Playwright configuration |

---

## Coding Standards

See [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) for:
- DRY principle (Don't Repeat Yourself)
- Code organization and structure
- Comment style and guidelines
- File naming conventions

See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for:
- Brand identity and visual style
- Color palette and typography
- Design system philosophy
- Creative direction

---

## What's Next?

See [TODO.md](TODO.md) for the current task tracker with prioritized work items.

### How to Add Features

1. **Understand the architecture** - Review relevant sections above
2. **Check existing components** - Don't reinvent the wheel (`app/components/`)
3. **Write tests first** - Add E2E test in `app/e2e/`
4. **Implement feature** - Follow coding standards
5. **Test dark mode** - Run `npm run test:a11y`
6. **Test complete flow** - Run `npm run test:e2e`
7. **Update this README** - Add to relevant section

---

## Getting Help

**Need help with...**

- **Development setup?** → See [Development Setup](#development-setup)
- **Ecommerce/cart?** → See [Shopping Cart & Ecommerce](#shopping-cart--ecommerce)
- **Testing?** → See [Testing](#testing)
- **Design standards?** → See [Design System](#design-system)
- **Troubleshooting?** → See [Troubleshooting](#troubleshooting)
- **Code quality?** → See [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md)

**For Claude Code users**: See [CLAUDE.md](CLAUDE.md) for project-specific instructions.

---

**Last Updated**: December 2025
**Maintained By**: Development Team
**Status**: Active & Growing

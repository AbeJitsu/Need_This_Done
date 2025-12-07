# Stack Analysis: Current vs. Expected Configuration

**Date:** 2025-12-06 (Updated: Investigation Complete)
**Current Branch:** `experiment` (synced with `dev`)
**Status:** ✅ DESIGN CONFIRMED - Supabase CLI architecture is intentional and well-designed

---

## Executive Summary

The codebase **correctly uses Supabase CLI for local development** (not docker-compose). This separates concerns cleanly:
- **Commerce layer:** docker-compose (nginx, Next.js app, Medusa, Redis)
- **Auth layer:** Supabase CLI (PostgreSQL, API, real-time, file storage)

The architecture is **already configured and ready to activate** - just needs `supabase start` command.

### Evidence of Supabase Integration

The code references Supabase in multiple locations:

```
✅ .env.local                           - Production Supabase URL and keys
✅ .env.test                            - Test Supabase credentials (localhost:54321)
✅ app/lib/supabase.ts                 - Supabase client library
✅ app/lib/supabase-server.ts          - Server-side Supabase
✅ app/app/auth/callback/route.ts      - Supabase auth callback
✅ app/app/api/files/[...path]/route.ts - Supabase file storage
✅ app/__tests__/lib/supabase.test.ts   - Supabase integration tests
✅ app/vitest.integration.setup.ts      - Supabase test configuration
```

---

## Docker Stack Comparison

### What We Have (Current State)

```yaml
✅ NGINX       - Reverse proxy (port 443 HTTPS)
✅ Next.js     - Frontend + API (port 3000 internal)
✅ Medusa      - Ecommerce backend (port 9000 internal)
✅ Redis       - Caching (port 6379 internal)
✅ PostgreSQL  - Medusa DB (port 5432 internal)

❌ SUPABASE    - USER DATABASE (MISSING!)
```

### What Was Planned (from git history)

From commit `a951fa2`:
> "Set up Supabase local development with real test credentials. This activates local Supabase development so tests can run against real Docker services..."

The plan included:
- Supabase container running on localhost:54321
- Real PostgreSQL instance for user auth
- File storage (S3-like)
- Real-time capabilities for live features

---

## Supabase's Role in Ecommerce

### Why We Need Supabase

| Feature | Purpose |
|---------|---------|
| **User Authentication** | Sign up, login, sessions |
| **User Profiles** | Store user data (name, email, preferences) |
| **Order History** | Link orders to authenticated users |
| **File Storage** | Product images, user avatars |
| **Real-time Updates** | Live cart/inventory changes |
| **RLS (Row-Level Security)** | Users can only see their own data |

### Current State

- **Auth:** Users can sign in (code exists) but no Supabase backend
- **Profiles:** No user profile data stored
- **Orders:** Created in Medusa but not linked to users
- **Files:** API endpoint expects Supabase but will fail
- **Real-time:** No WebSocket support for live features

---

## Environment Variables Reference

### Production (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oxhjtmozsdstbokwtnwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...
```

**Status:** ✅ Valid production credentials (but tests won't use these)

### Test Local (`.env.test`)

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7U...
```

**Status:** ⚠️ References localhost:54321 but NO container running there

---

## What Needs to Happen

### Phase 1: Add Supabase Container (CRITICAL)

**File:** `docker-compose.yml`

Need to add:
```yaml
supabase:
  image: supabase/postgres:15.1.0.117
  # OR: Use docker-compose with Supabase CLI
  # See: https://github.com/supabase/supabase/tree/master/docker

  environment:
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: postgres

  ports:
    - "5432:5432"  # For local dev

  networks:
    - app_network
```

**Note:** There are TWO ways to do this:
1. **Supabase CLI** (recommended) - Full Supabase stack locally
2. **Just PostgreSQL** - Minimal approach (loses real-time, file storage)

### Phase 2: Update docker-compose Services

The docker-compose currently passes Supabase env vars to the app:

```yaml
app:
  environment:
    - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

This is correct **IF** Supabase container exists to connect to.

### Phase 3: Database Migrations

Once Supabase is running, migrations need to be applied:

```bash
supabase db pull  # Get schema from cloud
supabase migration new <name>  # Create new migrations
supabase db push  # Apply to local instance
```

---

## Decision Made ✅

### Architecture: Supabase CLI + docker-compose

**Why this approach:**

1. **Separation of Concerns**
   - Commerce (Medusa, products, orders) → docker-compose
   - Authentication (users, profiles) → Supabase CLI
   - Clean, independent scaling

2. **Already Configured**
   - supabase/config.toml exists and is complete
   - supabase/migrations/ contains real schema
   - app/.env.test has correct credentials

3. **Production-Ready**
   - Supabase CLI creates identical environment to cloud
   - No discrepancies between local and production
   - Real RLS, real auth, real file storage

4. **Easy Local Development**
   - One command: `supabase start`
   - Automatic credentials generation
   - Can reset with `supabase db reset`

### Why Not Other Options

**Option B (Just PostgreSQL):**
- ❌ Would lose auth system
- ❌ Would lose file storage
- ❌ Tests would fail
- ❌ Doesn't match production

**Option C (Production Supabase):**
- ❌ Pollution of production database
- ❌ Slow feedback loops
- ❌ Dangerous for development
- ❌ Can't run tests in parallel

---

## Files Affected by Missing Supabase

### Will Fail Without Supabase

```
❌ app/app/api/files/[...path]/route.ts
   - Uploads to Supabase storage

❌ app/app/auth/callback/route.ts
   - Processes OAuth callback from Supabase

❌ app/__tests__/lib/supabase.test.ts
   - Integration tests expecting Supabase
```

### May Fail in Tests

```
⚠️ app/vitest.integration.setup.ts
   - Sets up test Supabase credentials
   - Tests will timeout if can't connect

⚠️ Any auth-related E2E tests
   - Need real auth system to test
```

### Use But Don't Fail

```
✅ app/lib/supabase.ts
   - Client library (just config, doesn't connect on load)

✅ app/lib/supabase-server.ts
   - Server client (same)
```

---

## Recommended Next Steps

### Immediate Actions (Priority Order)

1. **✅ Investigation Complete** - Supabase CLI architecture documented
2. **🚀 Start Supabase Locally** - Required for auth, file storage, real-time features
3. **🧪 Test Against Real Stack** - Variants fix and auth both work with real Supabase
4. **📝 Documentation** - Create developer setup guide

### Step-by-Step Implementation

**Phase 1: Start Supabase CLI**

Prerequisites: Supabase CLI installed
```bash
# 1. Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# 2. Start the local Supabase instance
cd /Users/abereyes/Projects/Personal/Need_This_Done
supabase start

# This will:
# - Start PostgreSQL on 127.0.0.1:54322
# - Start Supabase API on 127.0.0.1:54321
# - Print connection credentials
```

Expected output:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Anon Key: eyJ...
Service Role Key: eyJ...
```

**Phase 2: Update .env.local with Supabase Credentials**

```bash
# Copy credentials from `supabase status` output into .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
SUPABASE_ACCESS_TOKEN=<optional, for CLI commands>
```

**Phase 3: Apply Migrations**

```bash
# Apply database migrations to local Supabase instance
supabase db push

# This will:
# - Create auth tables
# - Create user profile tables
# - Create RLS (Row-Level Security) policies
# - Create storage buckets for file uploads
```

**Phase 4: Start the Full Stack**

```bash
# In another terminal, start docker-compose services
docker-compose up -d

# This will start:
# - nginx (https://localhost)
# - Next.js app (http://localhost:3000, accessed via nginx)
# - Medusa backend (http://medusa:9000)
# - Redis cache
# - Medusa PostgreSQL database
```

**Phase 5: Verify Everything Works**

```bash
# 1. Check docker containers are running
docker-compose ps

# 2. Check Supabase is running
supabase status

# 3. Test app with variants
curl -ks https://localhost/api/shop/products | jq '.products[0].variants'

# 4. Test auth (visit https://localhost and try logging in)
```

### Development Workflow

When working on the project:

```bash
# Terminal 1: Start Supabase (runs until you stop it)
supabase start

# Terminal 2: Start docker-compose
docker-compose up

# Terminal 3: Run tests
cd app && npm test
cd app && npm run test:e2e
```

When done for the day:

```bash
# Stop docker services
docker-compose down

# Stop Supabase
supabase stop
```

If you need to reset everything:

```bash
# Stop everything
docker-compose down
supabase stop

# Clean reset (WARNING: deletes all local data)
supabase db reset

# Start fresh
supabase start
docker-compose up -d
```

---

## Branch Sync Status

- **main:** Unknown (needs investigation)
- **dev:** No Supabase container
- **experiment:** No Supabase container (synced with dev)
- **feature/compare-dev-stack:** Merge branch (created but empty)

### Next Merge Investigation

Need to compare:
```bash
git diff main dev -- docker-compose.yml
git diff dev experiment -- docker-compose.yml
```

---

## Files to Create/Update

| File | Status | Action |
|------|--------|--------|
| `docker-compose.yml` | ⚠️ Missing Supabase | ADD container |
| `.env.example` | ✅ Exists | UPDATE with Supabase vars |
| `.supabase/config.toml` | ❓ Unknown | CHECK if exists |
| `supabase/migrations/` | ❓ Unknown | CHECK for schema |
| Docs | ⚠️ Missing | CREATE setup guide |

---

## 🔍 Investigation Results

### What We Found

**Supabase is intentionally managed via CLI, NOT docker-compose:**

✅ **supabase/config.toml** - Full Supabase CLI configuration exists
- API running on port 54321 (localhost:54321)
- Database on port 54322
- Realtime enabled
- Migrations enabled

✅ **supabase/migrations/** - Real migration files exist (~8 migrations)
- Tables, RLS policies, functions already defined
- Ready to apply

✅ **app/.env.test** - Test credentials point to CLI instance
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

✅ **Commit a951fa2** - "Set up Supabase local development" (Dec 6, 2025)
- Mentions running `supabase start` to get real instance with Redis and Medusa
- Created .env.test with actual local Supabase credentials
- Added npm scripts for Supabase CLI lifecycle

### Branch Comparison

| Branch | Services | Supabase |
|--------|----------|----------|
| main | nginx, app, redis | ❌ None (baseline) |
| dev | nginx, app, redis, medusa_postgres, medusa | ❌ CLI only (not in docker-compose) |
| experiment | nginx, app, redis, medusa_postgres, medusa | ❌ CLI only (not in docker-compose) |

**KEY FINDING:** Supabase is **intentionally not in docker-compose.yml** - it's managed separately via `supabase start`

### Architectural Decision

**The Stack Uses Two Separate Systems:**

```
┌─────────────────────────────────────┐
│   docker-compose (commerce layer)   │
│                                     │
│  nginx → app → medusa + redis       │
│         ↓ (port 9000)               │
│    medusa_postgres                  │
└─────────────────────────────────────┘
         ↓ HTTP calls

┌─────────────────────────────────────┐
│  Supabase CLI (user auth layer)     │
│                                     │
│  API (port 54321)                   │
│    ↓                                │
│  PostgreSQL (port 54322)            │
│    ↓                                │
│  Migrations (supabase/)             │
└─────────────────────────────────────┘

Next.js connects to BOTH:
- Medusa: http://medusa:9000
- Supabase: http://127.0.0.1:54321 (or https://prod-url in production)
```

## Questions Answered

- [x] Was Supabase removed intentionally or accidentally?
  - **INTENTIONALLY** - Architecture separates commerce (docker) from auth (CLI)

- [x] Should we use full Supabase or just PostgreSQL?
  - **FULL SUPABASE CLI** - Already configured and migrations exist

- [x] Are there existing migrations we need to apply?
  - **YES** - supabase/migrations/ contains ~8 migration files ready to apply

- [x] Should variants fix wait for Supabase or work independently?
  - **INDEPENDENT** - Variants only affect Medusa product data, not auth/user system

- [x] What's in the main branch for Supabase setup?
  - **MINIMAL** - Main has no Medusa or Supabase, just nginx/app/redis

---

## Related Commits

- `a951fa2` - "Set up Supabase local development with real test credentials"
- `1d84e6a` - "Add comprehensive environment configuration examples"
- `4fb0b2e` - "Add Docker testing skill with non-negotiable rules"

These commits mention Supabase but it's not currently in docker-compose.yml

---

## Summary

**The stack uses two complementary systems:**

| Layer | System | Status | Command |
|-------|--------|--------|---------|
| 🛒 Commerce | docker-compose | ✅ Ready | `docker-compose up -d` |
| 🔐 Auth | Supabase CLI | ✅ Configured | `supabase start` |

**Supabase Handles:**
- User authentication & OAuth
- User profiles & preferences
- File storage (project attachments)
- Real-time updates
- Row-Level Security policies

**Next Action:** Follow "Recommended Next Steps" to activate both systems and run tests against the full stack.

**Status:** ✅ READY TO GO - Just needs activation


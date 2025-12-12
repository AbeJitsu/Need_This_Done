# Environment Variables Audit & Update Plan

**Goal**: Ensure `.env.example` and `README.md` are complete and accurate, serving as the single source of truth for environment configuration.

**Created**: 2025-12-11
**Status**: Ready for execution in new session without .env restrictions

---

## Complete List of Environment Variables Found

### Core Application (33 variables total)

#### Supabase Database & Auth (3 variables)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (RLS-protected)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, bypasses RLS)

#### Redis Cache (2 variables)
- `REDIS_URL` - Redis connection string (default: `redis://redis:6379`)
- `SKIP_CACHE` - Boolean to bypass caching in dev (default: `false`)

#### Site Configuration (3 variables)
- `NEXT_PUBLIC_SITE_URL` - Public site URL for auth redirects
- `NEXT_PUBLIC_URL` - Public URL for metadata/SEO
- `NODE_ENV` - Environment (development/production)

#### Medusa E-commerce (7 variables)
- `MEDUSA_BACKEND_URL` - Medusa API URL (default: `http://medusa:9000`)
- `MEDUSA_DB_PASSWORD` - PostgreSQL password for Medusa DB
- `MEDUSA_JWT_SECRET` - JWT secret for customer auth
- `MEDUSA_ADMIN_JWT_SECRET` - JWT secret for admin auth
- `DATABASE_URL` - Full PostgreSQL connection string (auto-constructed in docker-compose)
- `COOKIE_SECRET` - Session cookie encryption secret
- `ADMIN_CORS` - CORS origins for admin panel

#### Stripe Payments (3 variables)
- `STRIPE_SECRET_KEY` - Stripe secret API key (server-side)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (client-side)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

#### Resend Email (3 variables)
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Sender email address
- `RESEND_ADMIN_EMAIL` - Admin notification email

#### OpenAI Chatbot (8 variables)
- `OPENAI_API_KEY` - OpenAI API key for chat and embeddings
- `NEXT_PUBLIC_CHATBOT_MODEL` - Chat model (default: `gpt-4o-mini`)
- `NEXT_PUBLIC_CHATBOT_MAX_TOKENS` - Max response tokens (default: `1000`)
- `NEXT_PUBLIC_CHATBOT_TEMPERATURE` - Chat temperature (default: `0.7`)
- `OPENAI_EMBEDDING_MODEL` - Embedding model (default: `text-embedding-3-small`)
- `EMBEDDING_BATCH_SIZE` - Batch size for embeddings (default: `100`)
- `VECTOR_SEARCH_SIMILARITY_THRESHOLD` - Min similarity score (default: `0.5`)
- `VECTOR_SEARCH_MAX_RESULTS` - Max search results (default: `5`)

#### Session Management (2 variables)
- `SESSION_SECRET` - Session encryption secret
- `SESSION_MAX_AGE` - Session duration in seconds (default: `2592000` = 30 days)

#### Testing Only (4 variables - NOT needed in .env.example)
- `BASE_URL` - Base URL for Playwright tests
- `APP_URL` - App URL for integration tests
- `CI` - Continuous integration flag
- `SKIP_WEBSERVER` - Skip webserver in tests
- `NEXT_PHASE` - Next.js build phase detection

---

## Current State Analysis

### ✅ env.md (Complete)
Contains all 33 production variables with:
- Organized sections
- Helpful comments
- Example/placeholder values
- Instructions on where to get values

### ❓ .env.example (Unknown - needs verification)
**Cannot read due to session restrictions.**

The next session should:
1. Read `.env.example`
2. Compare against the complete list above
3. Add any missing variables
4. Ensure comments and organization match env.md template

### ✅ README.md (Mostly complete, needs minor additions)
Lines 164-199 document environment variables but are missing:
- `NEXT_PUBLIC_URL` (used for SEO/metadata)
- `MEDUSA_BACKEND_URL` (auto-configured in docker-compose)
- `COOKIE_SECRET` (Medusa session management)
- `ADMIN_CORS` (Medusa admin panel security)
- `SESSION_SECRET` (app session management)
- `SESSION_MAX_AGE` (session duration)
- All chatbot configuration variables (8 total)

---

## Files Found Using Environment Variables

### App (TypeScript/JavaScript)
- `app/context/StripeContext.tsx` - Stripe publishable key
- `app/app/auth/callback/route.ts` - Supabase URL/keys, site URL
- `app/app/faq/page.tsx` - NEXT_PUBLIC_URL
- `app/app/how-it-works/page.tsx` - NEXT_PUBLIC_URL
- `app/app/api/chat/route.ts` - Vector search config
- `app/app/api/auth/signup/route.ts` - Site URL for redirects
- `app/app/api/health/route.ts` - Medusa backend URL
- `app/app/api/admin/users/route.ts` - Site URL
- `app/app/api/files/[...path]/route.ts` - Supabase URL/service key
- `app/app/page.tsx` - NEXT_PUBLIC_URL
- `app/app/pricing/page.tsx` - NEXT_PUBLIC_URL
- `app/app/login/page.tsx` - Site URL
- `app/app/services/page.tsx` - NEXT_PUBLIC_URL
- `app/emails/ClientConfirmation.tsx` - Site URL
- `app/emails/AdminNotification.tsx` - Site URL
- `app/components/chatbot/IndexingContext.tsx` - NODE_ENV
- `app/lib/stripe.ts` - Stripe secret key, webhook secret
- `app/lib/mockProjects.ts` - NODE_ENV
- `app/lib/supabase-server.ts` - Supabase URL/anon key
- `app/lib/email.ts` - Resend keys
- `app/lib/redis.ts` - Redis URL, NEXT_PHASE
- `app/lib/medusa-client.ts` - Medusa backend URL
- `app/lib/cache.ts` - SKIP_CACHE
- `app/lib/supabase.ts` - All Supabase keys, NEXT_PHASE

### Configuration
- `docker-compose.yml` - All Medusa, Redis, Supabase, and app env vars
- `medusa/medusa-config.js` - Medusa secrets, database URL, Redis URL
- `medusa/src/index.ts` - PORT, ADMIN_CORS
- `app/playwright.config.ts` - BASE_URL, CI
- `app/vitest.setup.ts` - Supabase keys, Redis URL
- `app/vitest.integration.setup.ts` - APP_URL, Redis URL, Supabase keys

---

## Action Plan for Next Session

### Task 1: Update .env.example
1. **Read** `.env.example` to see current state
2. **Compare** against the complete list above (33 variables)
3. **Add missing variables** with placeholder values:
   ```bash
   # Example format:
   VARIABLE_NAME=placeholder_value  # Description of what it's for
   ```
4. **Organize** into sections matching env.md:
   - Supabase Configuration
   - Redis Configuration
   - Site Configuration
   - Medusa E-commerce Backend
   - Stripe Payments
   - Resend Email Service
   - OpenAI Chatbot
   - Session Management
5. **Add comments** explaining:
   - What each variable is for
   - Where to get the value
   - Whether it's required or optional
   - Default values if applicable

### Task 2: Update README.md
1. **Read** README.md lines 164-199 (Environment Configuration section)
2. **Add missing variables**:
   - `NEXT_PUBLIC_URL`
   - `MEDUSA_BACKEND_URL`
   - `COOKIE_SECRET`
   - `ADMIN_CORS`
   - `SESSION_SECRET`
   - `SESSION_MAX_AGE`
   - All 8 chatbot configuration variables
3. **Ensure consistency** with .env.example format
4. **Add generation commands** for secrets where applicable:
   ```bash
   # Generate with: openssl rand -base64 32
   ```

### Task 3: Verify Completeness
1. **Cross-check** all 33 variables are in both files
2. **Test** that comments are helpful and accurate
3. **Validate** placeholder values are realistic
4. **Confirm** organization matches between files

### Task 4: Clean Up
1. **Delete or archive** `env.md` (temporary file, no longer needed)
2. **Update** last modified dates in headers
3. **Commit** changes with message:
   ```
   Complete environment variable documentation audit

   - Updated .env.example with all 33 required variables
   - Added missing variables to README.md environment section
   - Ensured both files are in sync and well-documented
   - README.md is now the single source of truth

   Variables added:
   - NEXT_PUBLIC_URL, MEDUSA_BACKEND_URL, COOKIE_SECRET, ADMIN_CORS
   - SESSION_SECRET, SESSION_MAX_AGE
   - All 8 OpenAI chatbot configuration variables
   ```

---

## Success Criteria

✅ `.env.example` contains all 33 variables with:
- Clear section headers
- Descriptive comments
- Placeholder values
- Instructions for obtaining values

✅ `README.md` Environment Configuration section contains all 33 variables with:
- Organized by service/feature
- Inline comments explaining purpose
- Example values
- Matches .env.example structure

✅ Both files are in sync
✅ No environment variables are referenced in code but missing from documentation
✅ env.md can be deleted (no longer needed)

---

## Notes for Implementation

- **DO NOT** include testing-only variables in .env.example (BASE_URL, APP_URL, CI, SKIP_WEBSERVER, NEXT_PHASE)
- **DO** use placeholder values that clearly indicate they need to be replaced:
  - `your_api_key_here`
  - `sk_test_YOUR_KEY`
  - `https://your-project.supabase.co`
- **DO** add comments explaining security implications:
  - `NEXT_PUBLIC_*` variables are exposed to browser
  - Server-only keys should never be prefixed with `NEXT_PUBLIC_`
  - Service role keys bypass RLS and must stay secret
- **DO** note which variables have defaults in the code:
  - `SKIP_CACHE` (defaults to false)
  - `REDIS_URL` (defaults to redis://localhost:6379)
  - Chatbot configuration (all have defaults)

---

**Ready for execution in session without .env file restrictions**

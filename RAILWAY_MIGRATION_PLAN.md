# Architecture Comparison & Migration Plan

## Visual Architecture Comparison

### Current Setup: Docker Compose on DigitalOcean

```
┌─────────────────────────────────────────────────────────────────┐
│                     DigitalOcean Droplet ($24/mo)              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Docker Network                         │ │
│  │                                                           │ │
│  │  ┌──────────┐         ┌──────────┐                      │ │
│  │  │  Nginx   │────────▶│ Next.js  │                      │ │
│  │  │  :80/443 │         │  :3000   │                      │ │
│  │  │          │         │ (Docker) │                      │ │
│  │  │ SSL Cert │         └─────┬────┘                      │ │
│  │  │ Manager  │               │                           │ │
│  │  └─────┬────┘               │                           │ │
│  │        │                    │                           │ │
│  │        │            ┌───────┼────────┐                  │ │
│  │        │            ▼       ▼        ▼                  │ │
│  │        │      ┌─────────┐ ┌────────┐ ┌──────────┐      │ │
│  │        └─────▶│ Medusa  │ │ Redis  │ │PostgreSQL│      │ │
│  │               │  :9000  │ │ :6379  │ │  :6432   │      │ │
│  │               │(Docker) │ │(Docker)│ │ (Docker) │      │ │
│  │               └────┬────┘ └───┬────┘ └────┬─────┘      │ │
│  │                    │          │           │            │ │
│  │                    └──────────┴───────────┘            │ │
│  │                         (shared network)               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ API calls
                               ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    │   (Cloud PaaS)   │
                    │                  │
                    │  • Auth service  │
                    │  • PostgreSQL DB │
                    │  • Storage       │
                    └──────────────────┘
```

**What's happening:**
- **One droplet** runs 5 Docker containers
- **Nginx** handles SSL, routing, reverse proxy
- **Next.js in Docker** = slower hot reload, complex volume mounts
- **Separate PostgreSQL** for Medusa = extra database to manage
- **Manual orchestration** via docker-compose
- **Manual deployment** = SSH, pull, rebuild, restart

**Pain points:**
- ❌ Complex docker-compose.yml (263 lines)
- ❌ Different configs for dev vs prod (docker-compose.yml vs docker-compose.prod.yml)
- ❌ SSL certificate management (self-signed local, Let's Encrypt prod)
- ❌ Next.js hot reload slow (Docker layer)
- ❌ Hours debugging local vs prod differences
- ❌ Manual deployment steps to remember
- ❌ 5 services to orchestrate and monitor

---

### Proposed Setup: Railway + Managed Services

```
┌─────────────────────────────────────────────────────────────────┐
│                    Railway Platform (~$10-18/mo)                │
│                                                                 │
│  ┌──────────────┐              ┌──────────────┐                │
│  │  Next.js     │              │   Medusa     │                │
│  │  Service     │──────────────│   Service    │                │
│  │              │   API calls  │              │                │
│  │  • Auto SSL  │              │  • Auto SSL  │                │
│  │  • Auto CDN  │              │  • Auto DNS  │                │
│  │  • Git deploy│              │  • Git deploy│                │
│  └──────┬───────┘              └───────┬──────┘                │
│         │                              │                       │
│         │                              │                       │
└─────────┼──────────────────────────────┼───────────────────────┘
          │                              │
          │                              │
          ▼                              ▼
    ┌──────────────┐         ┌───────────────────────┐
    │   Upstash    │         │     Supabase          │
    │   Redis      │         │   (Cloud PaaS)        │
    │   (Free)     │         │                       │
    │              │         │  ┌─────────────────┐  │
    │  • Global    │         │  │ public schema   │  │
    │  • Serverless│         │  │ (app tables)    │  │
    │  • No mgmt   │         │  └─────────────────┘  │
    └──────────────┘         │                       │
                             │  ┌─────────────────┐  │
                             │  │ medusa schema   │  │
                             │  │(Medusa tables)  │  │
                             │  └─────────────────┘  │
                             │                       │
                             │  ┌─────────────────┐  │
                             │  │ auth schema     │  │
                             │  │(Supabase auth)  │  │
                             │  └─────────────────┘  │
                             └───────────────────────┘
```

**What's happening:**
- **Railway services** run independently (Next.js + Medusa)
- **No nginx needed** (Railway handles SSL, routing, CDN)
- **No Docker locally for Next.js** = fast native hot reload
- **Single PostgreSQL** (Supabase) with schema separation
- **Managed Redis** (Upstash) = zero maintenance
- **Automatic deployment** = git push, Railway detects and deploys

**Benefits:**
- ✅ Simple architecture (2 services vs 5 containers)
- ✅ Single config works everywhere (no dev/prod differences)
- ✅ Automatic SSL (Railway manages certificates)
- ✅ Fast Next.js hot reload (runs natively locally)
- ✅ Git-push-to-deploy (zero manual steps)
- ✅ One database to manage (Supabase handles both schemas)
- ✅ Same or lower cost ($10-18/mo vs $24/mo)

---

### Local Development Comparison

#### Current Local Setup

```
Terminal 1:
$ docker-compose up
    ↓
  Starts 5 containers:
    • nginx (managing SSL certs, config)
    • Next.js (in Docker with volume mounts)
    • Medusa (in Docker)
    • PostgreSQL (in Docker)
    • Redis (in Docker)
    ↓
  Wait for health checks...
  Wait for dependencies...
  Wait for volumes to mount...
    ↓
  Finally ready after 2-3 minutes
    ↓
  Make a code change in Next.js
    ↓
  Hot reload runs through Docker layer (slow)
```

**Issues:**
- ❌ Slow startup (multiple containers, health checks)
- ❌ Slow hot reload (Docker volume mount overhead)
- ❌ Complex nginx config to maintain locally
- ❌ Self-signed SSL warnings in browser
- ❌ Heavy resource usage (5 containers running)

---

#### Proposed Local Setup

```
Terminal 1: Backend Services
$ npm run dev:backend
    ↓
  Starts 3 Docker containers:
    • Medusa (only backend service needed)
    • PostgreSQL (connects to Supabase OR local)
    • Redis (connects to Upstash OR local)
    ↓
  Ready in 30 seconds

Terminal 2: Frontend (Native)
$ npm run dev:frontend
    ↓
  Starts Next.js natively (no Docker)
    ↓
  Ready in 5 seconds
    ↓
  Make a code change
    ↓
  Instant hot reload (no Docker layer)
```

**Benefits:**
- ✅ Fast startup (backend services only)
- ✅ Instant hot reload (Next.js runs natively)
- ✅ No nginx needed locally
- ✅ No SSL complexity locally
- ✅ Lower resource usage (fewer containers)
- ✅ Simple npm scripts to remember

---

### Deployment Comparison

#### Current Deployment Workflow

```
1. Make changes locally
   ↓
2. Test with docker-compose up
   ↓
3. Commit changes
   ↓
4. Push to GitHub
   ↓
5. SSH into DigitalOcean droplet
   ↓
6. cd /app
   ↓
7. git pull
   ↓
8. Check environment variables in .env.prod
   ↓
9. docker-compose down
   ↓
10. docker-compose --env-file .env.prod \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up -d --build
    ↓
11. Wait for builds (5-10 minutes)
    ↓
12. Check logs: docker-compose logs -f
    ↓
13. Test in production
    ↓
14. Debug if something broke
    ↓
15. Repeat steps 6-14 if needed
```

**Time per deploy:** 10-30 minutes (if things go wrong)
**Steps to remember:** 15+
**Error-prone steps:** Environment vars, multiple compose files, manual SSL

---

#### Proposed Deployment Workflow

```
1. Make changes locally
   ↓
2. Test with npm run dev:all
   ↓
3. Commit changes
   ↓
4. Push to GitHub: git push origin main
   ↓
   ┌─────────────────────────────────┐
   │  Railway detects push           │
   │  Automatically builds & deploys │
   │  Next.js and Medusa services    │
   │  Runs health checks             │
   │  Routes traffic to new version  │
   └─────────────────────────────────┘
   ↓
5. Get deployment notification
   ↓
6. Test in production
   ↓
7. Done!
```

**Time per deploy:** 2-5 minutes (automated)
**Steps to remember:** 3 (commit, push, verify)
**Error-prone steps:** None (Railway handles everything)

---

### Cost Breakdown

#### Current Setup: DigitalOcean

```
┌────────────────────────────────────────┐
│ DigitalOcean Droplet (4GB RAM)        │
├────────────────────────────────────────┤
│ Monthly cost:                  $24.00  │
│                                        │
│ Includes:                              │
│  • 4GB RAM / 2 vCPUs                   │
│  • 80GB SSD storage                    │
│  • 4TB transfer                        │
│                                        │
│ Your responsibility:                   │
│  • Server management                   │
│  • Docker orchestration                │
│  • SSL certificate renewal             │
│  • Security updates                    │
│  • Backups                             │
│  • Monitoring                          │
│  • Scaling                             │
└────────────────────────────────────────┘
                 +
┌────────────────────────────────────────┐
│ Supabase (existing)                   │
├────────────────────────────────────────┤
│ Monthly cost:              $0 or $25   │
│ (depending on your current tier)       │
└────────────────────────────────────────┘

TOTAL: $24-49/month + significant time investment
```

---

#### Proposed Setup: Railway + Managed Services

```
┌────────────────────────────────────────┐
│ Railway Services                      │
├────────────────────────────────────────┤
│ Next.js service:            ~$5-8/mo   │
│ Medusa service:             ~$5-10/mo  │
│                                        │
│ Subtotal:                   $10-18/mo  │
│                                        │
│ Includes:                              │
│  • Automatic SSL                       │
│  • CDN / edge caching                  │
│  • Health checks                       │
│  • Auto-scaling                        │
│  • Git-push-to-deploy                  │
│  • Logs & monitoring                   │
│  • Branch previews                     │
│                                        │
│ Railway handles:                       │
│  • All server management               │
│  • SSL certificates                    │
│  • Security updates                    │
│  • Backups                             │
│  • Monitoring                          │
│  • Scaling                             │
└────────────────────────────────────────┘
                 +
┌────────────────────────────────────────┐
│ Upstash Redis                         │
├────────────────────────────────────────┤
│ Free tier:                      $0/mo  │
│  • 256MB storage                       │
│  • 500K commands/month                 │
│  • More than enough for MVP            │
│                                        │
│ Pay-as-you-go if exceeded:             │
│  • $0.20 per 100K commands             │
│  • Likely $0-5/month                   │
└────────────────────────────────────────┘
                 +
┌────────────────────────────────────────┐
│ Supabase (existing)                   │
├────────────────────────────────────────┤
│ Monthly cost:              $0 or $25   │
│ (same as current)                      │
│                                        │
│ Now handles BOTH:                      │
│  • App database (public schema)        │
│  • Medusa database (medusa schema)     │
│                                        │
│ No separate PostgreSQL needed!         │
└────────────────────────────────────────┘

TOTAL: $10-18/month + Supabase (same as current)
      = $10-43/month depending on Supabase tier

SAVINGS: $6-14/month vs current DigitalOcean
         + 5-10 hours/month saved on deployment debugging
```

---

### Complexity Comparison

#### Files to Manage

**Current Setup:**
```
Configuration files:
├── docker-compose.yml (263 lines)
├── docker-compose.prod.yml (production overrides)
├── nginx/nginx.conf (SSL, routing, caching)
├── nginx/Dockerfile (nginx setup)
├── app/Dockerfile.dev (Next.js dev image)
├── app/Dockerfile (Next.js prod image)
├── medusa/Dockerfile (Medusa image)
├── scripts/deploy.sh (manual deployment script)
├── .env.local (local environment)
└── .env.prod (production environment)

Total: 10+ config files to keep in sync
```

**Proposed Setup:**
```
Configuration files:
├── railway.json (Railway services config)
├── medusa/medusa-config.js (+ 4 lines for schema)
├── .env.local (works everywhere)
└── docker-compose.local.yml (optional, for backend services locally)

Total: 3-4 config files, no sync issues
```

---

#### Learning Curve

**Current Setup:**
```
You need to understand:
├── Docker basics
├── Docker Compose orchestration
├── Docker networking
├── Docker volumes and bind mounts
├── Nginx configuration
├── SSL certificate management (Let's Encrypt)
├── Reverse proxy concepts
├── Health checks and dependencies
├── Production vs development builds
└── Manual deployment procedures
```

**Proposed Setup:**
```
You need to understand:
├── Railway dashboard (deploy, logs, env vars)
├── Git push (you already know this)
└── That's basically it
```

---

### Risk & Reliability Comparison

#### Current Setup Risks

```
Single Point of Failure:
┌─────────────────────────────────┐
│   DigitalOcean Droplet          │
│                                 │
│   If this goes down:            │
│   • Entire site offline         │
│   • All services unavailable    │
│   • Must manually restart       │
│   • No automatic failover       │
└─────────────────────────────────┘

Manual Operations:
├── Forgot to restart a container? Site breaks.
├── Typo in docker-compose command? Site breaks.
├── Wrong environment file? Site breaks.
├── SSL cert expires? Site breaks.
└── Out of disk space? Site breaks.
```

**Proposed Setup Reliability:**

```
Distributed & Redundant:
┌─────────────────────────────────┐
│   Railway (Next.js)             │
│   • Multiple zones              │
│   • Auto health checks          │
│   • Auto restart on failure     │
│   • Zero-downtime deploys       │
└─────────────────────────────────┘
          +
┌─────────────────────────────────┐
│   Railway (Medusa)              │
│   • Multiple zones              │
│   • Auto health checks          │
│   • Auto restart on failure     │
│   • Zero-downtime deploys       │
└─────────────────────────────────┘
          +
┌─────────────────────────────────┐
│   Upstash Redis                 │
│   • Global replication          │
│   • 99.99% uptime SLA           │
│   • Auto scaling                │
└─────────────────────────────────┘
          +
┌─────────────────────────────────┐
│   Supabase                      │
│   • Multi-region backups        │
│   • 99.9% uptime SLA            │
│   • Auto scaling                │
└─────────────────────────────────┘

Automated Operations:
├── Service crashes? Railway auto-restarts.
├── Deploy failed? Auto-rollback to last working version.
├── SSL cert expires? Railway auto-renews.
├── High traffic? Railway auto-scales.
└── Need rollback? One-click revert to previous deploy.
```

---

### Feature Comparison Matrix

| Feature | Current (DigitalOcean) | Proposed (Railway) |
|---------|------------------------|-------------------|
| **SSL/HTTPS** | Manual (Let's Encrypt) | Automatic |
| **Custom Domain** | Manual DNS + config | Add in dashboard |
| **Deployments** | Manual SSH commands | Git push |
| **Rollbacks** | Manual restore | One-click |
| **Logs** | `docker-compose logs -f` | Dashboard + tail |
| **Monitoring** | DIY (need to set up) | Built-in |
| **Scaling** | Manual (resize droplet) | Automatic |
| **Health Checks** | DIY in docker-compose | Built-in |
| **Branch Previews** | Not available | Automatic |
| **Zero-Downtime Deploys** | No | Yes |
| **Auto-Restart on Crash** | Yes (docker restart policy) | Yes (built-in) |
| **Environment Variables** | Edit files on server | Dashboard |
| **Secrets Management** | Plain text in .env | Encrypted vault |
| **Backups** | DIY | Automatic (Supabase) |
| **CDN/Edge Caching** | DIY with nginx | Built-in (Railway) |
| **Geographic Distribution** | Single region | Multi-region |
| **Load Balancing** | DIY | Automatic |

---

## Summary

### Current Pain Points → Solutions

| Pain Point | Current | Proposed | Improvement |
|------------|---------|----------|-------------|
| **Deployment time** | 10-30 min manual | 2-5 min automatic | 5-6x faster |
| **Steps to deploy** | 15+ manual steps | 1 (git push) | 15x simpler |
| **Local startup** | 2-3 minutes | 5 seconds (frontend) | 24x faster |
| **Hot reload speed** | Slow (Docker) | Instant (native) | 10x faster |
| **Config files** | 10+ files | 3-4 files | 60% fewer |
| **Services to manage** | 5 containers | 0 (all managed) | 100% less work |
| **Monthly cost** | $24/mo | $10-18/mo | $6-14/mo cheaper |
| **SSL management** | Manual | Automatic | Zero effort |
| **Deployment errors** | Frequent | Rare | Much more reliable |
| **Time debugging** | 5-10 hrs/month | ~0 hrs/month | Priceless |

---

## The Bottom Line

**Current setup:** You're spending $24/month AND hours of your time managing Docker orchestration, deployments, SSL certificates, and debugging local vs production differences.

**Proposed setup:** Spend $10-18/month and let Railway handle all the infrastructure complexity. You write code, push to GitHub, and your app automatically deploys. No manual steps, no Docker complexity, no SSL headaches.

**ROI:** Even if you only save 2 hours per month, and value your time at just $20/hour, that's $40/month in time savings. The system pays for itself twice over, while being more reliable and easier to use.

**Risk:** Minimal. You can migrate incrementally, test everything before switching DNS, and keep DigitalOcean running as a backup for 1 week. If Railway doesn't work out (unlikely), you can always go back.

---

# Architecture Simplification Plan

## Problem Statement

Current deployment workflow is painful:
- **Hours debugging** local vs production differences
- **Complex Docker orchestration** (5+ services, different configs for dev/prod)
- **Manual deployment steps** that are hard to remember

---

# CLI-Based Migration Guide

## Overview

We'll use CLIs to automate the entire migration:
- **Railway CLI** - Deploy Next.js + Medusa services
- **Upstash CLI** - Create Redis database
- **Supabase CLI** - Create Medusa schema

This approach is fast, repeatable, and scriptable.

---

## Prerequisites Installation

### 1. Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Verify installation
railway --version
```

### 2. Install Upstash CLI

```bash
# macOS
brew tap upstash/upstash
brew install upstash

# Or download from https://github.com/upstash/cli/releases

# Verify installation
upstash --version
```

### 3. You already have Supabase access

We'll use SQL commands via Supabase dashboard or CLI.

---

## Migration Steps (CLI-Based)

### Phase 1: Set Up Upstash Redis (Free)

```bash
# 1. Login to Upstash
upstash auth login

# 2. Create Redis database
upstash redis create needthisdone-redis \
  --region us-east-1 \
  --type pay-as-you-go

# 3. Get connection URL (save this for later)
upstash redis get needthisdone-redis --output json | jq -r '.redis_url'
```

**Output:** You'll get a Redis URL like: `redis://default:xxxxx@xxxxx.upstash.io:6379`

**Save this URL** - we'll use it in Railway environment variables.

---

### Phase 2: Set Up Supabase Schema for Medusa

```bash
# Run this SQL in Supabase SQL Editor (console.supabase.com)
# Or use supabase CLI if you have it set up
```

**SQL to run:**
```sql
-- Create medusa schema
CREATE SCHEMA IF NOT EXISTS medusa;

-- Grant permissions
GRANT ALL ON SCHEMA medusa TO postgres;
GRANT ALL ON SCHEMA medusa TO authenticated;
GRANT ALL ON SCHEMA medusa TO service_role;

-- Verify schema was created
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'medusa';
```

**Get your Supabase connection string:**
- Go to Supabase dashboard → Settings → Database
- Copy the "Connection string" (Direct connection)
- It looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Save this URL** - we'll use it for Medusa's DATABASE_URL.

---

### Phase 3: Set Up Railway Project

```bash
# 1. Login to Railway
railway login

# 2. Create new project
railway init

# Follow prompts:
# - Project name: need-this-done
# - Create empty project: Yes

# 3. You're now in the Railway project context
```

---

### Phase 4: Deploy Medusa Service

```bash
# 1. Create Medusa service from medusa directory
cd medusa
railway up

# This will:
# - Detect Dockerfile
# - Build and deploy Medusa
# - Assign a URL

# 2. Set environment variables for Medusa
railway variables set DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
railway variables set REDIS_URL="redis://default:xxxxx@xxxxx.upstash.io:6379"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set ADMIN_JWT_SECRET="your-admin-jwt-secret"
railway variables set COOKIE_SECRET="your-cookie-secret"
railway variables set MEDUSA_ADMIN_PASSWORD="your-admin-password"
railway variables set ADMIN_CORS="https://needthisdone.com"
railway variables set STORE_CORS="https://needthisdone.com"

# 3. Get Medusa service URL
railway domain
# Save this URL - you'll use it as NEXT_PUBLIC_MEDUSA_URL
```

**Alternative: Set variables via Railway dashboard**
- Go to railway.app
- Select your project
- Select Medusa service
- Go to Variables tab
- Add all environment variables

---

### Phase 5: Deploy Next.js Service

```bash
# 1. Create Next.js service from app directory
cd ../app
railway up

# This will:
# - Detect Next.js app
# - Build and deploy
# - Assign a URL

# 2. Set environment variables for Next.js
railway variables set NEXT_PUBLIC_MEDUSA_URL="https://medusa-xxxxx.railway.app"
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://oxhjtmozsdstbokwtnwa.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
railway variables set REDIS_URL="redis://default:xxxxx@xxxxx.upstash.io:6379"
railway variables set STRIPE_SECRET_KEY="your-stripe-secret"
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable"
# ... add all other env vars from .env.local

# 3. Get Next.js service URL
railway domain
# This is your new app URL
```

---

### Phase 6: Configure Custom Domains (IMPORTANT for CORS)

**Why custom domains matter:**
Using Railway's default URLs (medusa-xxxxx.railway.app) causes CORS issues. Custom subdomains solve this:
- `needthisdone.com` (frontend)
- `api.needthisdone.com` (Medusa)
- Same parent domain = simple CORS configuration

```bash
# 1. Add custom domain for Next.js
cd app
railway domain add needthisdone.com

# 2. Add custom domain for Medusa
cd ../medusa
railway domain add api.needthisdone.com

# Railway will provide DNS records for both:
# - CNAME records to add to your DNS
# - SSL certificates (automatic via Let's Encrypt)
```

**Then update DNS at your registrar:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | [railway-provided-cname] | 300 |
| CNAME | api | [railway-provided-cname] | 300 |

**Wait for DNS propagation (5-30 minutes)**

**Verify DNS:**
```bash
# Check if DNS is propagated
dig needthisdone.com
dig api.needthisdone.com

# Or use: https://dnschecker.org
```

**Update environment variables after DNS propagation:**
```bash
# In Next.js service
railway variables set NEXT_PUBLIC_MEDUSA_URL="https://api.needthisdone.com"

# In Medusa service (update CORS to allow frontend)
railway variables set STORE_CORS="https://needthisdone.com"
railway variables set ADMIN_CORS="https://needthisdone.com"
```

**CORS Configuration Explained:**
- `STORE_CORS` - Allows your frontend (needthisdone.com) to call Medusa store API
- `ADMIN_CORS` - Allows admin dashboard to access Medusa admin API
- Medusa automatically adds correct CORS headers for these origins

---

### Phase 7: Verify Deployment

```bash
# 1. Check service status
railway status

# 2. View logs for Medusa
cd medusa
railway logs

# 3. View logs for Next.js
cd ../app
railway logs

# 4. Test endpoints
curl https://your-medusa-url.railway.app/health
curl https://your-nextjs-url.railway.app/api/health
```

---

## Simplified Local Development Setup

### Create Simplified docker-compose.local.yml

**File:** `/docker-compose.local.yml`

```yaml
services:
  # Option 1: Just Medusa (connect to cloud Redis and Supabase)
  medusa:
    build: ./medusa
    ports: ["9000:9000"]
    environment:
      DATABASE_URL: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
      REDIS_URL: redis://default:xxxxx@xxxxx.upstash.io:6379
      # ... other env vars from .env.local

  # Option 2: Or include local Redis if you prefer
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

### Update package.json Scripts

**Add to root package.json:**

```json
{
  "scripts": {
    "dev:backend": "docker-compose -f docker-compose.local.yml up",
    "dev:frontend": "cd app && npm run dev",
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

### Install concurrently

```bash
npm install --save-dev concurrently
```

### New Local Workflow

```bash
# Start everything
npm run dev:all

# Or start separately:
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## Environment Variables Checklist

### Variables you need to collect from .env.local:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Medusa:**
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `COOKIE_SECRET`
- `MEDUSA_ADMIN_PASSWORD`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**URLs (will be updated after Railway setup):**
- `NEXT_PUBLIC_MEDUSA_URL` → Railway Medusa URL
- `REDIS_URL` → Upstash Redis URL
- `DATABASE_URL` → Supabase connection string

**Medusa CORS:**
- `ADMIN_CORS` → Your domain
- `STORE_CORS` → Your domain

---

## Files to Modify

### 1. medusa/medusa-config.js

Add schema configuration:

```javascript
projectConfig: {
  database_url: DATABASE_URL,
  database_type: "postgres",
  database_schema: "medusa",  // ← ADD THIS
  database_extra: {            // ← ADD THIS
    options: "-c search_path=medusa,public"
  },
  redis_url: REDIS_URL,
  // ... rest of config
}
```

### 2. Create railway.json (optional, for config)

**File:** `/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": null,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## Rollback Plan

If something goes wrong:

1. **DNS is still pointing to DigitalOcean** - No impact to users
2. **Test Railway deployment first** - Use Railway URLs to test
3. **Only switch DNS when confident** - Update DNS as final step
4. **Keep DigitalOcean running for 1 week** - As backup
5. **Easy rollback** - Just switch DNS back to DigitalOcean IP

---

## Cost Summary

**Before migration:** $24/month (DigitalOcean)

**After migration:**
- Railway: $10-18/month (Next.js + Medusa)
- Upstash: $0/month (free tier)
- Supabase: (existing cost, no change)

**Total: $10-18/month** (potentially cheaper!)

---

## Timeline

**Total migration time: 1-2 hours**

- Phase 1 (Upstash): 5 minutes
- Phase 2 (Supabase schema): 5 minutes
- Phase 3 (Railway project): 2 minutes
- Phase 4 (Medusa deploy): 15-20 minutes
- Phase 5 (Next.js deploy): 15-20 minutes
- Phase 6 (Custom domains): 5 minutes + DNS propagation
- Phase 7 (Verification): 10 minutes

**Then:** Keep both running for 1 week, decommission DigitalOcean when confident.

---

## Branch Strategy for Migration

**Create migration branch:**
```bash
git checkout -b railway-migration
```

**Why use a branch:**
- ✅ Keep `main` branch stable (DigitalOcean setup intact)
- ✅ Test Railway deployment safely
- ✅ Can revert if issues arise
- ✅ Production stays live during migration

**Workflow:**
1. Work on `railway-migration` branch locally
2. Push to GitHub: `git push origin railway-migration`
3. Configure Railway to deploy from `railway-migration` branch
4. Test thoroughly on Railway URLs (no DNS changes yet)
5. When confident, merge to `main`
6. Update DNS to point to Railway
7. Keep DigitalOcean running for 1 week as backup

**Railway branch configuration:**
- In Railway dashboard → Settings → Branch
- Set to deploy from `railway-migration`
- Later switch to `main` after merge

---

## Next Steps

1. **Create migration branch** - `git checkout -b railway-migration`
2. **Review this plan** - Ensure everything is clear
3. **Collect environment variables** - From current .env.local
4. **Install CLIs** - Railway, Upstash
5. **Execute migration** - Follow CLI steps above
6. **Test on Railway URLs** - Verify all functionality
7. **Merge to main** - When confident
8. **Switch DNS** - Point domain to Railway
9. **Monitor** - Watch logs for 24-48 hours
10. **Decommission DO** - After 1 week of stability

---

## Problem Statement (Original)

Current deployment workflow is painful:
- **Hours debugging** local vs production differences
- **Complex Docker orchestration** (5+ services, different configs for dev/prod)
- **Manual deployment steps** that are hard to remember
- **Frequent deploys** make this pain constant

## Goals

**Primary Goal:**
Easy way to see production, make targeted fixes locally, and push to the right service without restarting multiple containers.

**Specific Objectives:**
1. ✅ **Targeted deployments** - Change Next.js → only Next.js redeploys. Change Medusa → only Medusa redeploys.
2. ✅ **Clear production visibility** - Each service has separate logs, metrics, and deployment history
3. ✅ **Simple deployment** - `git push` and Railway handles everything automatically
4. ✅ **Zero-downtime deploys** - No service interruptions during updates
5. ✅ **Easy rollbacks** - Revert specific service to previous version with one click
6. ✅ **Keep full-stack local development** - Still run everything locally for testing

**What this solves:**
- ❌ Current: Change one file → restart all 5 containers (5-10 minutes)
- ✅ Railway: Change one service → only that service redeploys (2-3 minutes)
- ❌ Current: Check logs across 5 containers to debug
- ✅ Railway: Each service has its own clear log stream
- ❌ Current: Manual SSH, git pull, docker commands
- ✅ Railway: Automatic deployment from git push
5. ✅ Enable frequent, confident deploys

## Recommended Architecture

### Overview

**Shift from:** Self-managed Docker orchestration on DigitalOcean
**Shift to:** Managed services with simple local dev setup

### Component Breakdown

| Component | Local | Production | Cost |
|-----------|-------|------------|------|
| **Next.js Frontend** | `npm run dev` (no Docker) | Vercel | $0 (MVP) / $20 (commercial) |
| **Medusa Backend** | Docker Compose | Railway | ~$10-15/month |
| **PostgreSQL** | Docker Compose | Railway (included) | Included |
| **Redis** | Docker Compose | Upstash | $0-5/month |
| **Supabase** | Cloud (existing) | Cloud (existing) | Current cost |

**Total Monthly Cost:** ~$10-20/month (MVP) or ~$30-40/month (commercial)
**Current Cost:** $12/month
**Cost Increase:** $8-28/month
**Time Saved:** 5-10 hours/month (deployment debugging)

## Detailed Implementation Plan

### Phase 1: Simplify Local Docker Setup

**Current local complexity:**
- docker-compose.yml with 5 services
- nginx with self-signed SSL certs
- Volume mounts for hot reloading
- Environment variable juggling
- Next.js running inside Docker

**New simplified local setup:**

1. **Run Next.js natively** (outside Docker)
   - Just `npm run dev` in the app directory
   - No nginx needed locally
   - No SSL needed locally
   - Fast hot reloading (no Docker layer)
   - Access at `http://localhost:3000`

2. **Run backend services via simple Docker Compose**
   - Only Medusa, PostgreSQL, and Redis
   - No nginx
   - No environment complexity
   - One `docker-compose up` command

3. **Create `docker-compose.local.yml`** (simplified)
   ```yaml
   services:
     redis:
       image: redis:7-alpine
       ports: ["6379:6379"]

     postgres:
       image: postgres:15-alpine
       environment:
         POSTGRES_DB: medusa
         POSTGRES_USER: medusa
         POSTGRES_PASSWORD: medusa_local
       ports: ["5432:5432"]
       volumes:
         - postgres_data:/var/lib/postgresql/data

     medusa:
       build: ./medusa
       ports: ["9000:9000"]
       environment:
         DATABASE_URL: postgresql://medusa:medusa_local@postgres:5432/medusa
         REDIS_URL: redis://redis:6379
       depends_on:
         - postgres
         - redis

   volumes:
     postgres_data:
   ```

4. **Create simple npm scripts** in root `package.json`
   ```json
   {
     "scripts": {
       "dev:backend": "docker-compose -f docker-compose.local.yml up",
       "dev:frontend": "cd app && npm run dev",
       "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
     }
   }
   ```

**Benefits:**
- One command to start everything: `npm run dev:all`
- Next.js hot reload is FAST (no Docker layer)
- No nginx configuration to manage locally
- No SSL certificate headaches
- Backend services isolated in Docker (consistent behavior)

### Phase 2: Set Up Vercel for Frontend

**Why Vercel:**
- Built by Next.js creators (perfect compatibility)
- Zero-config deployments
- Automatic SSL/HTTPS
- Branch preview deployments
- Edge caching built-in
- No nginx/server management

**Steps:**

1. **Connect GitHub repo to Vercel**
   - Go to vercel.com
   - Import project from GitHub
   - Select `Need_This_Done` repo
   - Set root directory to `app/`

2. **Configure environment variables in Vercel**
   - All variables from `.env.local`
   - Use Vercel dashboard to set:
     - `NEXT_PUBLIC_MEDUSA_URL` → Railway Medusa URL (after Phase 3)
     - `NEXT_PUBLIC_SUPABASE_URL` → existing
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → existing
     - All other app-specific env vars

3. **Configure deployment settings**
   - Production branch: `main`
   - Development branch: `dev` (automatic preview deploys)
   - Build command: `npm run build`
   - Output directory: `.next`

4. **Test deployment**
   - Push to `dev` branch
   - Vercel automatically builds and deploys
   - Get preview URL to test
   - Verify everything works

**Deployment flow:**
```
git push origin dev
↓
Vercel detects push via webhook
↓
Automatic build & deploy
↓
Preview URL: https://need-this-done-<hash>.vercel.app
↓
Merge to main → Automatic production deploy
```

### Phase 3: Set Up Railway for Medusa

**Why Railway:**
- Simple git-push-to-deploy
- Includes PostgreSQL (no separate provisioning)
- Built-in Redis option (or use Upstash)
- One-click deployments
- Good free tier for development

**Steps:**

1. **Create Railway project**
   - Go to railway.app
   - Connect GitHub repo
   - Select `Need_This_Done` repo

2. **Create Medusa service**
   - Add service from repo
   - Set root directory: `medusa/`
   - Railway auto-detects Dockerfile

3. **Add PostgreSQL database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically provides `DATABASE_URL`
   - Automatically linked to Medusa service

4. **Configure environment variables**
   - Railway provides `DATABASE_URL` automatically
   - Add manually:
     - `REDIS_URL` → Upstash URL (from Phase 4)
     - `JWT_SECRET`
     - `ADMIN_JWT_SECRET`
     - `COOKIE_SECRET`
     - `MEDUSA_ADMIN_PASSWORD`

5. **Get public URL**
   - Railway provides: `https://your-app.railway.app`
   - Use this for `NEXT_PUBLIC_MEDUSA_URL` in Vercel

6. **Configure health checks**
   - Railway auto-detects `/health` endpoint
   - Restarts service if unhealthy

**Deployment flow:**
```
git push origin main
↓
Railway detects push via webhook
↓
Automatic build & deploy
↓
Production: https://medusa.railway.app
```

### Phase 4: Set Up Upstash for Redis

**Why Upstash:**
- Serverless Redis (pay per request)
- Global replication
- Zero management
- Free tier covers development
- VERY cheap for low traffic

**Steps:**

1. **Create Upstash account**
   - Go to upstash.com
   - Create free account

2. **Create Redis database**
   - Click "Create Database"
   - Name: `needthisdone-redis`
   - Region: Choose closest to Railway region
   - Type: Regional (cheaper) or Global (lower latency worldwide)

3. **Get connection URL**
   - Upstash provides: `redis://...`
   - Copy this URL

4. **Update environment variables**
   - Railway Medusa: Set `REDIS_URL` to Upstash URL
   - Vercel Next.js: Set `REDIS_URL` to Upstash URL (if app uses Redis)
   - Local `.env.local`: Keep pointing to `redis://localhost:6379`

**Local vs Production:**
- Local: Uses Docker Redis (`redis://localhost:6379`)
- Production: Uses Upstash Redis (secure URL)

### Phase 5: Configure GitHub Actions (Optional)

**Note:** Vercel and Railway have native git-push-to-deploy, so GitHub Actions might be redundant. But if you want more control:

**Option A: Use platform-native deploys** (simpler)
- Push to GitHub → Vercel & Railway auto-deploy
- No GitHub Actions needed
- Less to maintain

**Option B: Use GitHub Actions** (more control)
- Keep your existing workflow files
- Simplify them to just trigger platform deployments
- Example: Call Vercel API or Railway API to deploy

**Recommendation:** Start with Option A (platform-native). If you need more control later (like running tests before deploy), add GitHub Actions.

### Phase 6: Update Local Development Workflow

**New daily workflow:**

1. **Start backend services:**
   ```bash
   npm run dev:backend
   ```
   Starts: Medusa, PostgreSQL, Redis (via Docker)

2. **Start frontend** (in another terminal):
   ```bash
   npm run dev:frontend
   ```
   Starts: Next.js dev server at localhost:3000

3. **Access locally:**
   - Frontend: http://localhost:3000
   - Medusa Admin: http://localhost:9000/admin
   - Medusa API: http://localhost:9000/store

4. **When done:**
   ```bash
   Ctrl+C (stop frontend)
   docker-compose -f docker-compose.local.yml down (stop backend)
   ```

**Benefits:**
- Simple, memorable commands
- Fast Next.js hot reload
- Backend services isolated and consistent
- No nginx/SSL complexity locally

### Phase 7: Update Deployment Workflow

**New deployment workflow:**

1. **Make changes locally** → test with `npm run dev:all`

2. **Commit and push to dev branch:**
   ```bash
   git add .
   git commit -m "feature: add new functionality"
   git push origin dev
   ```

3. **Automatic preview deploys:**
   - Vercel: https://need-this-done-<hash>.vercel.app
   - Railway: https://medusa-<hash>.railway.app
   - Test in preview environment

4. **Merge to main when ready:**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

5. **Automatic production deploys:**
   - Vercel: https://needthisdone.com
   - Railway: https://medusa.needthisdone.com (custom domain)

**No manual steps. No remembering commands. Just push and deploy.**

## Migration Strategy

### Step 1: Set up new infrastructure (parallel to existing)
- Set up Vercel, Railway, Upstash
- Test with preview deployments
- **Keep DigitalOcean running** (zero downtime)

### Step 2: Simplify local Docker setup
- Create `docker-compose.local.yml`
- Test new local workflow
- Update documentation

### Step 3: Test production deployments
- Deploy to Railway/Vercel
- Verify all functionality works
- Test end-to-end: checkout, payments, appointments

### Step 4: Switch DNS
- Update needthisdone.com DNS to point to Vercel
- Update medusa subdomain to point to Railway
- Monitor for issues

### Step 5: Decommission DigitalOcean
- Keep running for 1 week as backup
- If everything stable, shut down droplet
- Export any logs/data needed

**Total migration time:** 4-6 hours (can be done incrementally)

## Cost-Benefit Analysis

### Current Setup
- **Cost:** $12/month (DigitalOcean droplet)
- **Time:** 5-10 hours/month debugging deployments
- **Pain level:** High (manual steps, local/prod parity issues)

### New Setup
- **Cost:** $10-20/month (MVP) or $30-40/month (commercial)
- **Time:** ~0 hours/month on deployments (automated)
- **Pain level:** Low (git push, automatic deploys, no manual steps)

### ROI Calculation
Even if you value your time at just $20/hour:
- **Time saved:** 5-10 hours/month = $100-200/month
- **Cost increase:** $0-28/month
- **Net benefit:** $72-200/month

**If deployment automation saves you even 2 hours/month, it pays for itself.**

## Risks & Mitigations

### Risk: More expensive
- **Mitigation:** Start with free tiers (Vercel Free + Railway credit)
- **Mitigation:** Only upgrade to paid when making revenue
- **Mitigation:** Cancel DigitalOcean after successful migration

### Risk: Vendor lock-in
- **Mitigation:** All services have export/migration options
- **Mitigation:** Code remains portable (still Next.js + Medusa)
- **Mitigation:** Can always move back to DigitalOcean if needed

### Risk: Learning curve for new platforms
- **Mitigation:** Vercel and Railway have excellent docs
- **Mitigation:** Much simpler than managing Docker orchestration
- **Mitigation:** Strong community support

### Risk: Loss of control
- **Mitigation:** Still have full access to logs, metrics, configs
- **Mitigation:** Can always drop down to custom Docker if needed
- **Mitigation:** Railway allows custom Dockerfiles (you control the build)

## Success Metrics

**You'll know this is working when:**
1. ✅ Local setup: One command to start full stack
2. ✅ Local dev: Next.js hot reload is FAST (no Docker lag)
3. ✅ Deployment: Push to GitHub, automatic deploy, no manual steps
4. ✅ Debugging: No more hours spent on local/prod differences
5. ✅ Confidence: You can deploy multiple times per day without stress

## Next Steps

**Immediate:**
1. Review this plan - does it address your pain points?
2. Confirm budget ($10-40/month depending on phase)
3. Decide: Platform-native deploys OR GitHub Actions

**Then:**
1. Create simplified `docker-compose.local.yml`
2. Test new local workflow
3. Set up Vercel (frontend)
4. Set up Railway (Medusa)
5. Set up Upstash (Redis)
6. Test preview deployments
7. Migrate production traffic
8. Decommission DigitalOcean

**Timeline:** 1-2 days to set up, 1 week to verify stability, then decommission old setup.

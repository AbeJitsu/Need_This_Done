# Docker Setup Guide

This document explains how our Docker architecture works, how to start/stop the system, and how to troubleshoot common issues.

## Architecture Overview

Our application runs in Docker with multiple services working together:

```
┌──────────────────────────────────────────────────────────┐
│  Your Computer (localhost)                               │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  nginx (The Front Door)                            │  │
│  │  Ports: 80 (HTTP), 443 (HTTPS)                    │  │
│  │  - Handles SSL/HTTPS                               │  │
│  │  - Routes traffic to the app                       │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  nextjs_app (Your Application)                   │  │
│  │  Port: 3000                                       │  │
│  │  - Next.js frontend + API routes                 │  │
│  │  - Bridges to Medusa backend & Supabase          │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  redis (Fast Cache)                              │  │
│  │  Port: 6379                                       │  │
│  │  - Session storage                                │  │
│  │  - Products, carts, orders cache                 │  │
│  │  - Shared between app & Medusa                   │  │
│  └────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  medusa (Ecommerce Backend)                        │  │
│  │  Port: 9000                                         │  │
│  │  - Product catalog API                             │  │
│  │  - Shopping cart API                               │  │
│  │  - Order management                                │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  medusa_postgres (Ecommerce Database)            │  │
│  │  Port: 6432 (internal)                            │  │
│  │  - Product & variant data                         │  │
│  │  - Shopping carts                                 │  │
│  │  - Orders (separate from app users)               │  │
│  └────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  storybook_dev (Component Library - Dev)          │  │
│  │  Port: 6006                                         │  │
│  │  - Interactive component development               │  │
│  │  - Visual component documentation                 │  │
│  │  - Dev mode only (not in production)              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**External Services:**
- **Supabase** - User database and authentication (hosted at `oxhjtmozsdstbokwtnwa.supabase.co`)
- **Medusa (internal)** - Ecommerce service running in Docker
- Credentials loaded from `.env.local` files

## Two Operating Modes

### Production Mode
**Files:** `docker-compose.yml`

**When to use:**
- Testing production builds
- Deployment simulation
- Performance testing

**Characteristics:**
- Multi-stage optimized builds
- Small image sizes (~50MB for app)
- No source code mounting
- Runs compiled/minified code
- Restart required for code changes

**Start production mode:**
```bash
docker-compose up --build
```

### Development Mode (Recommended for local work)
**Files:** `docker-compose.yml` + `docker-compose.dev.yml`

**When to use:**
- Local development
- Testing features
- Debugging

**Characteristics:**
- Source code mounted as volume
- Hot reload (changes appear instantly)
- All dev dependencies included
- Better error messages
- Debugging tools enabled
- Port 3000 exposed directly
- Storybook component library on port 6006

**Start development mode:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Common Commands

### Starting the System

**Development mode (recommended):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**Development mode (background):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

**Production mode:**
```bash
docker-compose up
```

### Stopping the System

**Stop containers (keeps data):**
```bash
docker-compose down
```

**Stop and remove volumes (fresh start):**
```bash
docker-compose down -v
```

### Rebuilding

**Rebuild everything:**
```bash
docker-compose build
```

**Rebuild specific service:**
```bash
docker-compose build app
```

**Force rebuild without cache:**
```bash
docker-compose build --no-cache app
```

### Viewing Logs

**All services:**
```bash
docker-compose logs -f
```

**Specific service:**
```bash
docker logs nextjs_app
docker logs redis
docker logs nginx
docker logs storybook_dev  # Dev mode only
```

**Last 50 lines:**
```bash
docker logs nextjs_app --tail 50
```

### Checking Status

**See running containers:**
```bash
docker ps
```

**Verify configuration:**
```bash
docker-compose config
```

**Check specific container health:**
```bash
docker inspect nextjs_app
```

## Environment Variables

### Required Files

Two `.env.local` files are needed:
- `/Users/abereyes/Projects/Personal/Need_This_Done/.env.local` (root)
- `/Users/abereyes/Projects/Personal/Need_This_Done/app/.env.local` (app directory)

**Note:** Both files should have identical content for consistency.

### Critical Variables

```bash
# =========================================================================
# Supabase Configuration (Required)
# =========================================================================
NEXT_PUBLIC_SUPABASE_URL=https://oxhjtmozsdstbokwtnwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...     # Secret key

# =========================================================================
# Site Configuration (Required for OAuth)
# =========================================================================
NEXT_PUBLIC_SITE_URL=https://localhost

# =========================================================================
# Medusa Ecommerce Configuration
# =========================================================================
MEDUSA_BACKEND_URL=http://medusa:9000           # Internal Docker URL
MEDUSA_DB_PASSWORD=your-secure-medusa-password
MEDUSA_JWT_SECRET=your-medusa-jwt-secret-key
MEDUSA_ADMIN_JWT_SECRET=your-medusa-admin-jwt-secret

# Client-side Medusa URL (for local dev)
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000

# =========================================================================
# Redis (Auto-configured in Docker)
# =========================================================================
REDIS_URL=redis://redis:6379

# =========================================================================
# Session (Optional - currently unused)
# =========================================================================
SESSION_SECRET=generated-random-string
SESSION_MAX_AGE=2592000
```

**Environment loading:**
- Docker Compose reads from root `.env.local`
- Next.js reads from `app/.env.local`
- Variables are passed to containers via `docker-compose.yml`

## Troubleshooting

### Issue: "Module not found" errors

**Symptom:**
```
Module not found: Can't resolve '@supabase/ssr'
```

**Cause:** Docker container built before dependency was added to package.json

**Solution:**
```bash
# Clean everything
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Rebuild without cache
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache app

# Start fresh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Issue: ".env.local not found"

**Symptom:**
```
env file .env.local not found: stat .env.local: no such file or directory
```

**Cause:** Environment file is missing or temporarily inaccessible

**Solution:**
1. Verify file exists:
   ```bash
   ls -la .env.local
   ls -la app/.env.local
   ```

2. Check file permissions:
   ```bash
   chmod 644 .env.local
   chmod 644 app/.env.local
   ```

3. If missing, copy from example:
   ```bash
   cp .env.example .env.local
   cp app/.env.example app/.env.local
   ```

4. Verify Docker can read it:
   ```bash
   docker-compose config | grep -A 5 environment
   ```

### Issue: Port already in use

**Symptom:**
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Solution:**
1. Find what's using the port:
   ```bash
   lsof -i :3000  # or :80, :443, :6379
   ```

2. Stop the conflicting service or change ports in `docker-compose.dev.yml`

### Issue: Container keeps restarting

**Symptom:** Container shows "Restarting" status

**Solution:**
1. Check logs for errors:
   ```bash
   docker logs nextjs_app --tail 100
   ```

2. Common causes:
   - Missing environment variables
   - Invalid Supabase credentials
   - Redis connection failed
   - Port conflicts

3. Test manually:
   ```bash
   docker-compose up  # without -d to see real-time logs
   ```

### Issue: "Cannot find module '/app/server.js'"

**Symptom:**
```
Error: Cannot find module '/app/server.js'
```

**Cause:** You built with production settings but ran with dev settings. The dev compose file mounts your local source code over `/app`, hiding the `server.js` that the production build created.

**Solution:** Always use `--build` when starting dev mode:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This ensures the dev Dockerfile is used, which runs `npx next dev` instead of looking for `server.js`.

### Issue: Changes not appearing (dev mode)

**Symptom:** Code changes don't show in browser

**Cause:** Volume mounting issue or running production mode

**Solution:**
1. Verify you're in dev mode:
   ```bash
   docker ps --format "{{.Names}}\t{{.Image}}"
   # Should show Dockerfile.dev for app
   ```

2. Check volume mounting:
   ```bash
   docker inspect nextjs_app | grep -A 10 Mounts
   ```

3. Restart in dev mode:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart app
   ```

### Issue: Redis connection errors

**Symptom:**
```
Error: connect ECONNREFUSED redis:6379
```

**Solution:**
1. Check Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Check Redis health:
   ```bash
   docker exec redis redis-cli ping
   # Should return: PONG
   ```

3. Restart Redis:
   ```bash
   docker-compose restart redis
   ```

### Issue: Medusa won't start or keeps restarting

**Symptom:**
```
medusa service is in "Restarting" state
```

**Solutions:**
1. Check Medusa logs:
   ```bash
   docker logs medusa --tail 50
   ```

2. Verify database is running:
   ```bash
   docker ps | grep medusa_postgres
   # Should show running state
   ```

3. Check environment variables:
   ```bash
   docker-compose config | grep -A 10 "medusa:"
   # Should show MEDUSA_* variables
   ```

4. Verify Medusa PostgreSQL health:
   ```bash
   docker exec medusa_postgres pg_isready -U medusa
   # Should return "accepting connections"
   ```

5. Restart Medusa:
   ```bash
   docker-compose restart medusa
   ```

6. If still broken, full restart:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Issue: Cannot connect to Medusa API from Next.js

**Symptom:**
```
Error: Failed to fetch products from Medusa
```

**Solutions:**
1. Verify Medusa is running:
   ```bash
   curl http://localhost:9000/health
   # Should return 200 OK
   ```

2. Check the API response:
   ```bash
   curl http://localhost:9000/store/products
   # Should return JSON with products
   ```

3. Verify environment variable in .env.local:
   ```bash
   # app/.env.local should have:
   NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
   ```

4. Check Next.js logs for errors:
   ```bash
   docker logs nextjs_app | grep -i medusa
   ```

5. Make sure Medusa dependencies installed:
   ```bash
   # In medusa/ directory
   npm install
   ```

### Issue: Medusa database migration errors

**Symptom:**
```
Error: Failed to run migration
```

**Solutions:**
1. Reset Medusa database:
   ```bash
   docker exec medusa_postgres dropdb -U medusa medusa --if-exists
   docker exec medusa_postgres createdb -U medusa medusa
   ```

2. Check database connection:
   ```bash
   docker exec medusa_postgres psql -U medusa -d medusa -c "SELECT 1;"
   # Should return: 1
   ```

3. View migration status:
   ```bash
   docker logs medusa | grep -i migration
   ```

## Package Management

### Adding a new npm package

When you add a package to `app/package.json`, the Docker container needs to be updated:

```bash
# Option 1: Rebuild the container
docker-compose build app

# Option 2: Install in running container (temporary)
docker exec nextjs_app npm install package-name

# Option 3: Full clean rebuild (most reliable)
docker-compose down -v
docker-compose build --no-cache app
docker-compose up
```

**Important:** Changes to `package.json` always require a rebuild.

## Storybook Commands (Dev Mode Only)

Storybook runs automatically when you start the dev stack. Here are useful commands for working with it:

### View Storybook

**Interactive dev server (recommended):**
```bash
# Starts automatically with dev stack, or access directly:
open http://localhost:6006
```

**Static build (via nginx):**
```bash
# Pre-built documentation at:
open https://localhost/design
```

### Manage Storybook Container

**View Storybook logs:**
```bash
docker logs storybook_dev -f
```

**Restart Storybook only:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart storybook
```

**Stop Storybook without affecting other services:**
```bash
docker stop storybook_dev
```

**Start Storybook after stopping:**
```bash
docker start storybook_dev
```

### Build Static Storybook

To update the static build served at `/design`:

```bash
# Build Storybook to storybook-static/
docker exec nextjs_app npm run build-storybook

# The nginx /design route will automatically serve the new build
```

### Troubleshooting Storybook

**Storybook not starting:**
```bash
# Check logs
docker logs storybook_dev

# Rebuild the container
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build storybook
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up storybook
```

**Port 6006 already in use:**
```bash
# Find what's using it
lsof -i :6006

# Or change the port in docker-compose.dev.yml:
# ports:
#   - "6007:6006"  # Maps host 6007 to container 6006
```

**Hot reload not working:**
```bash
# Restart the Storybook container
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart storybook

# Or rebuild if that doesn't work
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache storybook
```

## Health Checks

The system includes automatic health monitoring:

- **Redis:** Checked every 10 seconds via `redis-cli ping`
- **Next.js:** Checked every 30 seconds via `/api/health` endpoint
- **Nginx:** Basic HTTP health check

View health status:
```bash
docker ps  # Look for "(healthy)" or "(unhealthy)"
```

## Access Points

When running in development mode:

- **Next.js App:** http://localhost:3000 - Main application
- **Via Nginx (HTTP):** http://localhost - Through reverse proxy
- **Via Nginx (HTTPS):** https://localhost - Secure proxy
- **Medusa API:** http://localhost:9000 - Ecommerce backend
- **Medusa Health:** http://localhost:9000/health - API health check
- **Products API:** http://localhost:9000/store/products - Product catalog
- **Storybook (dev):** http://localhost:6006 - Interactive component development with hot reload
- **Storybook (static):** https://localhost/design - Pre-built component documentation via nginx
- **Redis:** localhost:6379 (if you need direct access)

**Recommended:**
- Use http://localhost:3000 for app development
- Use http://localhost:6006 for component development in Storybook
- Use http://localhost:9000 for Medusa API testing

## Clean Slate (Nuclear Option)

If everything is broken and you need a completely fresh start:

```bash
# Stop everything
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Remove all related images
docker rmi need_this_done-app need_this_done-nginx

# Remove dangling images
docker image prune -f

# Remove all stopped containers
docker container prune -f

# Rebuild from scratch
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache

# Start fresh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Quick Reference

**Most common workflow:**

```bash
# Start development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Stop when done
docker-compose down

# After adding npm packages (in dev mode)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# If things are broken (dev mode)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Kill everything and start fresh (clean slate)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Understanding the Files

### docker-compose.yml (Base Configuration)
- Defines the three services: nginx, app, redis
- Sets up networking and volumes
- Loads environment from `.env.local`
- Used for production builds

### docker-compose.dev.yml (Development Overrides)
- Overrides production settings for development
- Mounts source code as volume for hot reload
- Exposes ports directly (3000, 6379)
- Uses `Dockerfile.dev` instead of `Dockerfile`
- Sets `NODE_ENV=development`

### app/Dockerfile (Production)
- Multi-stage build for optimization
- Installs only production dependencies
- Compiles Next.js for production
- Runs as non-root user for security
- Final image ~50MB

### app/Dockerfile.dev (Development)
- Single-stage build for speed
- Installs all dependencies (including dev)
- Doesn't copy source code (mounted as volume)
- Runs `next dev` with hot reload
- More debugging tools available

## Tips for AI Assistants

When helping with this Docker setup:

1. **Always ask which mode** the user is running (production vs development)
2. **For module errors**, rebuild is almost always the answer
3. **Check environment variables** with `docker-compose config` first
4. **Development mode** is default for local work
5. **Clean rebuilds** (`--no-cache`) fix most mysterious issues
6. **Logs are your friend**: `docker logs nextjs_app` shows what's happening
7. **Both .env.local files** should have identical content

## Related Documentation

- [CLAUDE.md](CLAUDE.md) - Project instructions and coding standards
- [docs/url-configuration.md](docs/url-configuration.md) - URL configuration details
- [app/README.md](app/README.md) - Next.js application details

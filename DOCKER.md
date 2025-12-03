# Docker Setup Guide

This document explains how our Docker architecture works, how to start/stop the system, and how to troubleshoot common issues.

## Architecture Overview

Our application runs in Docker with three main services that work together:

```
┌─────────────────────────────────────────────────────┐
│  Your Computer (localhost)                          │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  nginx (The Front Door)                      │  │
│  │  Ports: 80 (HTTP), 443 (HTTPS)              │  │
│  │  - Handles SSL/HTTPS                         │  │
│  │  - Routes traffic to the app                 │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │  nextjs_app (Your Application)               │  │
│  │  Port: 3000                                   │  │
│  │  - Next.js frontend + API routes             │  │
│  │  - Connects to Supabase (external)           │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │  redis (Fast Cache)                          │  │
│  │  Port: 6379                                   │  │
│  │  - Session storage                            │  │
│  │  - Temporary data cache                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  storybook_dev (Component Library - Dev)    │  │
│  │  Port: 6006                                   │  │
│  │  - Interactive component development         │  │
│  │  - Visual component documentation            │  │
│  │  - Dev mode only (not in production)         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**External Services:**
- **Supabase** - Database and authentication (hosted at `oxhjtmozsdstbokwtnwa.supabase.co`)
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
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://oxhjtmozsdstbokwtnwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...     # Secret key

# Site Configuration (Required for OAuth)
NEXT_PUBLIC_SITE_URL=https://localhost

# Redis (Auto-configured in Docker)
REDIS_URL=redis://redis:6379

# Session (Optional - currently unused)
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

- **Direct to Next.js:** http://localhost:3000
- **Via Nginx (HTTP):** http://localhost
- **Via Nginx (HTTPS):** https://localhost
- **Storybook (dev server):** http://localhost:6006 - Interactive component development with hot reload
- **Storybook (static build):** https://localhost/design - Pre-built component documentation via nginx
- **Redis:** localhost:6379 (if you need direct access)

**Recommended:**
- Use http://localhost:3000 for app development
- Use http://localhost:6006 for component development in Storybook

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

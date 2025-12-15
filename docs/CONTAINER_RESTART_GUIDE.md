# Container Restart Guide

**Last Updated:** December 2025

## Quick Reference: When to Restart What

| You Changed... | Restart This | Why | Command |
|---------------|--------------|-----|---------|
| **Next.js code** (`app/lib/`, `app/app/`, `app/components/`) | Nothing* | Hot reload auto-restarts | *Wait 2-3 seconds* |
| **API routes** (`app/app/api/`) | `nextjs_app` | Sometimes hot reload misses API changes | `./scripts/docker.sh restart website` |
| **Environment variables** (`.env.local`) | `nextjs_app` + `medusa_backend` | Env vars loaded at startup | `./scripts/docker.sh restart website store` |
| **Medusa backend** (`medusa/`) | `medusa_backend` | No hot reload in Medusa | `./scripts/docker.sh restart store` |
| **Nginx config** (`nginx/nginx.conf`) | `nginx` | Config loaded at startup | `./scripts/docker.sh restart front-door` |
| **Docker configs** (`docker-compose*.yml`, Dockerfiles) | Everything | Need rebuild | `./scripts/docker.sh rebuild <service>` |
| **Package changes** (`package.json`, `package-lock.json`) | Affected service | Rebuild with new deps | `./scripts/docker.sh rebuild <service>` |

\* Hot reload works **most of the time** but not always. If changes don't appear, manual restart is needed.

---

## How Hot Reload Works

### ✅ Has Hot Reload (Auto-Restart)
**Next.js App** (`nextjs_app`)
- **How:** Volume mount (`./app:/app`) + Next.js dev mode
- **When it works:** Most `.ts`, `.tsx`, `.js`, `.jsx` file changes
- **When it fails:**
  - API route changes sometimes don't trigger reload
  - Changes to `next.config.js`
  - Adding new dependencies
  - Environment variable changes
- **Fix:** Manual restart if changes don't appear after 3 seconds

**Storybook** (`storybook_dev`)
- **How:** Volume mount + Storybook dev mode
- **When it works:** Component story changes
- **When it fails:** Storybook config changes
- **Fix:** Manual restart

### ❌ No Hot Reload (Always Restart Manually)
**Medusa Backend** (`medusa_backend`)
- **Why:** Medusa doesn't have hot reload built in
- **Restart for:** ANY code change in `medusa/` directory
- **Command:** `./scripts/docker.sh restart store`

**Nginx** (`nginx`)
- **Why:** Nginx config loaded at startup only
- **Restart for:** ANY config change in `nginx/` directory
- **Command:** `./scripts/docker.sh restart front-door`

**Redis & Postgres** (`redis`, `medusa_postgres`)
- **Why:** Data services, no code to change
- **Restart for:** Never (unless service crashes)

---

## Restart vs Rebuild

### When to **Restart** (faster, preserves data)
```bash
./scripts/docker.sh restart <service>
```
- Code changes (within existing dependencies)
- Config file changes
- Environment variable changes
- Service not responding

### When to **Rebuild** (slower, clean slate)
```bash
./scripts/docker.sh rebuild <service>
```
- `package.json` / `package-lock.json` changes (new dependencies)
- Dockerfile changes
- Build configuration changes
- Persistent bugs that restart doesn't fix

---

## Common Scenarios

### Scenario 1: Fixed Checkout Bug (API Route Change)
**What changed:** `app/app/api/checkout/session/route.ts`

**Hot reload worked?** Sometimes no (API routes can be tricky)

**Solution:**
```bash
./scripts/docker.sh restart website
```

**Why:** Force Next.js to reload API routes

---

### Scenario 2: Updated Medusa Payment Logic
**What changed:** `medusa/src/services/cart-service.ts`

**Hot reload worked?** Never (Medusa has no hot reload)

**Solution:**
```bash
./scripts/docker.sh restart store
```

**Why:** Medusa requires manual restart for all changes

---

### Scenario 3: Added New npm Package
**What changed:** `package.json` + `package-lock.json`

**Hot reload worked?** Never (dependencies installed at build time)

**Solution:**
```bash
./scripts/docker.sh rebuild website  # If package added to app/
./scripts/docker.sh rebuild store    # If package added to medusa/
```

**Why:** Need to reinstall node_modules

---

### Scenario 4: Changed Environment Variables
**What changed:** `.env.local`

**Hot reload worked?** Never (env vars loaded at container start)

**Solution:**
```bash
# If changed Next.js env vars
./scripts/docker.sh restart website

# If changed Medusa env vars
./scripts/docker.sh restart store

# If changed both
./scripts/docker.sh restart website store
```

**Why:** Environment variables are only read at startup

---

### Scenario 5: Updated Nginx SSL Config
**What changed:** `nginx/nginx.conf`

**Hot reload worked?** Never (nginx config loaded at start)

**Solution:**
```bash
./scripts/docker.sh restart front-door
```

**Why:** Nginx must reload config

---

## Debugging: Changes Not Appearing?

### 1. Check the Logs
```bash
./scripts/docker.sh logs website   # For Next.js
./scripts/docker.sh logs store     # For Medusa
```

Look for:
- Compilation errors
- Module not found errors
- Syntax errors preventing reload

### 2. Hard Restart
```bash
./scripts/docker.sh restart website
```

Force Next.js to fully restart and recompile.

### 3. Nuclear Option (Fresh Start)
```bash
./scripts/docker.sh rebuild website
```

Completely rebuilds the container from scratch.

### 4. Check Volume Mounts
```bash
docker inspect nextjs_app --format='{{.Mounts}}'
```

Verify `./app` is mounted to `/app` in container.

---

## Pro Tips

### Tip 1: Restart After Pulling from Git
After `git pull`, always restart services that changed:
```bash
# Check what files changed
git diff HEAD@{1} --name-only

# Restart relevant services
./scripts/docker.sh restart website  # If app/ changed
./scripts/docker.sh restart store    # If medusa/ changed
```

### Tip 2: Watch Mode (Coming Soon)
We plan to add file watching that auto-restarts services:
```bash
./scripts/docker.sh watch  # Auto-restart on file changes
```

### Tip 3: Multiple Services at Once
```bash
./scripts/docker.sh restart website store front-door
```

Restarts all specified services in sequence.

### Tip 4: Status Check First
```bash
./scripts/docker.sh status
```

See what's running before restarting.

---

## Summary: The Foolproof Restart Checklist

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

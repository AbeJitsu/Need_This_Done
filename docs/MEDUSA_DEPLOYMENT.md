# Medusa v2 Railway Deployment - Verified Working Configuration

**Last updated:** Jan 22, 2026 (Commit: a67f1f0)
**Status:** ✅ Tested and working on production
**Deployment:** https://need-this-done-production.up.railway.app

---

## The Working Configuration

This is the ONLY configuration we've verified works on Railway with NODE_ENV=production set globally.

### `medusa-v2/nixpacks.toml`

```toml
# Railway deployment config for Medusa v2
# Working pattern: build at runtime with NODE_ENV override
# Note: NODE_ENV=production during build breaks config resolution in Medusa v2.12+
# Solution: build with NODE_ENV=development, then switch to production for runtime
[phases.setup]
nixPkgs = ["nodejs_20", "npm-9_x"]

[phases.install]
cmds = ["npm install --legacy-peer-deps --production=false"]

[phases.build]
cmds = ["echo 'Build at runtime to avoid npm install timeout'"]

[start]
cmd = "NODE_ENV=development npm run build && NODE_ENV=production medusa db:migrate && medusa start"
```

### `medusa-v2/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "NODE_ENV=development npm run build && NODE_ENV=production medusa db:migrate && medusa start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Required Environment Variables (Railway Dashboard)

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | CRITICAL - must be set globally in Railway |
| `HOST` | `0.0.0.0` | **Required** - allows external connections |
| `DISABLE_MEDUSA_ADMIN` | `true` | **Required** - admin won't work on Railway |
| `DATABASE_URL` | postgres connection | From Supabase or Railway Postgres |
| `JWT_SECRET` | random secure string | Generate with `openssl rand -base64 32` |
| `COOKIE_SECRET` | random secure string | Generate with `openssl rand -base64 32` |
| `ADMIN_CORS` | admin URL | e.g., `https://admin.yoursite.com` |
| `STORE_CORS` | storefront URL | e.g., `https://yoursite.com` |

---

## Why This Configuration Works (The Deep Dive)

### The Problems We Encountered

**Problem 1: Build fails with "Cannot find module '/app/medusa-config'"**
- **Root cause:** When `NODE_ENV=production` is set globally in Railway, `medusa build` cannot resolve TypeScript config files (Medusa v2.12+ regression)
- **Solution:** Override `NODE_ENV=development` just for the build step
- **Reference:** [Medusa Issue #14229](https://github.com/medusajs/medusa/issues/14229)

**Problem 2: ts-node missing error during build**
- **Root cause:** When `npm install` runs with `NODE_ENV=production`, npm skips installing devDependencies by default. `ts-node` is a devDependency needed for the build.
- **Solution:** Add `--production=false` flag to force npm to install ALL dependencies
- **Command:** `npm install --legacy-peer-deps --production=false`

**Problem 3: Healthcheck timeout failures**
- **Root cause:** The startup command was taking too long. If the server doesn't respond to /health within 300 seconds, Railway kills the container.
- **Why 300 seconds?** The build (`npm run build`) + migrations (`medusa db:migrate`) can take 30-45 seconds total.
- **Solution:** Skip build during Docker build phase and run it at startup instead

### The Timing Flow

```
1. Nixpacks install phase (~26s)
   npm install --legacy-peer-deps --production=false
   (all dependencies installed, including ts-node and build tools)

2. Nixpacks build phase (instant)
   echo 'Build at runtime to avoid npm install timeout'
   (skipped to avoid COPY overwrite issue)

3. Container starts, runs start command:
   NODE_ENV=development npm run build     (~25s - compiles TypeScript config)
   NODE_ENV=production medusa db:migrate  (~10s - runs database migrations)
   NODE_ENV=production medusa start       (immediate - starts server)

4. Healthcheck queries /health within ~50s total
   ✅ Server responds with 200 OK
   ✅ Deployment succeeds

Total startup: ~50 seconds ✓ (well within 300s timeout)
```

### Why NOT These Approaches

**❌ Build during Docker build phase:**
```toml
[phases.build]
cmds = ["npm run build"]  # DON'T DO THIS
```
**Problem:** Nixpacks does `COPY . /app` AFTER the build phase, overwriting the `.medusa/` directory with source files. Build output is lost.

**❌ Run from `.medusa/server` directory:**
```bash
cmd = "cd .medusa/server && npm install && npm run start"  # DON'T DO THIS
```
**Problem:** The `npm install` in `.medusa/server` takes 2+ minutes, exceeding the healthcheck timeout.

**❌ Include npm install in start command:**
```bash
cmd = "npm install && npm run build && medusa db:migrate && medusa start"  # DON'T DO THIS
```
**Problem:** npm install is already done in the install phase. Running it again adds 30+ seconds and risks timeout.

**❌ Seed products on every deploy:**
```bash
cmd = "npm run build && medusa db:migrate && npm run seed && medusa start"  # DON'T DO THIS
```
**Problem:** `npm run seed` starts the entire Medusa application, adding 30+ seconds to startup. Products only need seeding ONCE.

---

## Seeding Products (One-Time Setup)

### Initial Seed (Do This Once)

After deployment succeeds and server is running:

```bash
cd medusa-v2
railway run npm run seed
```

This creates:
- Default sales channel
- Default region (United States)
- Default shipping profile
- Stock location
- Publishable API key
- Your products (consultations)

### Adding Products Later

Use the Admin API or UI (if exposed), not the seed script.

---

## Verification

After deployment completes, verify:

```bash
# 1. Health endpoint responds
curl https://need-this-done-production.up.railway.app/health
# Expected: HTTP 200 OK with body "OK"

# 2. API requires publishable key
curl https://need-this-done-production.up.railway.app/store/products
# Expected: JSON error about missing x-publishable-api-key
```

If both pass, deployment is successful.

---

## Troubleshooting

### Symptom: Healthcheck fails repeatedly

**Diagnosis:** Check deploy logs (not build logs) for:
- `ERROR: Cannot find module '/app/medusa-config'` → ts-node not installed or NODE_ENV issue
- `ERROR: Cannot find module 'ts-node'` → npm install skipped devDependencies
- `ERROR: Database connection failed` → DATABASE_URL issue
- `ERROR: Could not find index.html` → DISABLE_MEDUSA_ADMIN not set to true

**Fix based on error:**
- Config module not found → Ensure `NODE_ENV=development` override in start command
- ts-node missing → Ensure `--production=false` in install command
- Database error → Verify DATABASE_URL in Railway variables
- Admin error → Set `DISABLE_MEDUSA_ADMIN=true`

### Symptom: Server starts but /health returns 503

**Diagnosis:** Server is running but not ready
- Likely still running migrations
- Check logs for `medusa db:migrate` progress

**Fix:** Wait 60 more seconds, the healthcheck will keep retrying

### Symptom: Deployment was working, now fails

**Diagnosis checklist:**
1. Did you merge code from main to production? → Check if medusa-v2 config changed
2. Did Railway update? → Check Railway status page
3. Did Medusa package version change? → Check package.json in medusa-v2/

**Recovery:**
If unsure, rollback to the last known working deployment in Railway:
1. Go to Deployments tab
2. Find the last successful deployment (green checkmark)
3. Click menu (three dots) → Redeploy

---

## Key Learnings for Future Changes

**If you change anything in medusa-v2:**

1. Test locally first: `cd medusa-v2 && npm run build`
2. Commit to main branch
3. Merge main into production: `git checkout production && git merge main && git push`
4. Monitor Railway deployment
5. If it fails, check the deploy logs for the actual error (not build logs)

**If Medusa version changes:**

Review the [Medusa release notes](https://github.com/medusajs/medusa/releases) for breaking changes in:
- Build command output
- Configuration file expectations
- Module resolution changes

**If NODE_ENV handling changes in Railway:**

The start command must explicitly set `NODE_ENV=development` for the build step. Do NOT rely on global NODE_ENV.

---

## References

- [Medusa v2 Documentation](https://docs.medusajs.com)
- [Medusa Build Command](https://docs.medusajs.com/learn/build)
- [Railway Nixpacks](https://nixpacks.com/)
- [Medusa Issue #14229 - Config Resolution Bug](https://github.com/medusajs/medusa/issues/14229)
- [Medusa Issue #13943 - Docker Build Failures](https://github.com/medusajs/medusa/issues/13943)

---

## Deployment History

| Commit | Status | Issue | Notes |
|--------|--------|-------|-------|
| `a67f1f0` | ✅ Working | — | Correct: npm install --production=false, NODE_ENV overrides |
| `81034e3` | ❌ Failed | ts-node missing | Missing --production=false flag |
| `5faac32` | ❌ Failed | CONFIG not found | NODE_ENV override not yet applied |
| `ba4bc02` | ❌ Failed | cd medusa-v2 failed | Directory doesn't exist in build context |
| `448deab` | ❌ Failed | COPY overwrite | Build in build phase doesn't work with Nixpacks |
| `451441a2` (old) | ✅ Working | — | Reference working deployment before recent changes |

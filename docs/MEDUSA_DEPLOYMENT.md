# Medusa v2 Railway Deployment

Documentation for deploying Medusa v2 on Railway. Updated after extensive testing.

## Working Configuration

**This is the ONLY pattern that works reliably on Railway:**

### `medusa-v2/nixpacks.toml`
```toml
# Railway deployment config for Medusa v2
# Working pattern: build at runtime, admin disabled
[phases.setup]
nixPkgs = ["nodejs_20", "npm-9_x"]

[phases.install]
cmds = ["npm install --legacy-peer-deps"]

[phases.build]
cmds = ["echo 'Build at runtime'"]

[start]
cmd = "npm run build && medusa db:migrate && medusa start"
```

### `medusa-v2/railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && medusa db:migrate && medusa start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Required Environment Variables

Set these in Railway:

| Variable | Value | Notes |
|----------|-------|-------|
| `HOST` | `0.0.0.0` | **Required** - allows external connections |
| `DISABLE_MEDUSA_ADMIN` | `true` | **Required** - admin won't work on Railway |
| `DATABASE_URL` | your postgres URL | Supabase or Railway Postgres |
| `JWT_SECRET` | secure random string | |
| `COOKIE_SECRET` | secure random string | |
| `ADMIN_CORS` | your admin URL | |
| `STORE_CORS` | your storefront URL | |

Set via Railway CLI:
```bash
railway variables --set "HOST=0.0.0.0"
railway variables --set "DISABLE_MEDUSA_ADMIN=true"
```

## Seeding Products (IMPORTANT!)

### The Simple Explanation

Think of it like setting up a new store:

1. **Deploy** = Opening the store doors (happens every time you push code)
2. **Seed** = Putting products on the shelves (only do this ONCE)

Once products are on the shelves (in the database), they stay there. You don't need to put them back every time you open the doors.

### Why We DON'T Seed on Every Deploy

```
❌ BAD: npm run build && medusa db:migrate && npm run seed && medusa start
✅ GOOD: npm run build && medusa db:migrate && medusa start
```

**Why?**

1. `npm run seed` uses `medusa exec` which starts up the ENTIRE Medusa application
2. This adds 30+ seconds to startup time
3. Railway's healthcheck says "are you alive?" and if you don't answer fast enough, it kills you
4. Products only need to be created ONCE - they live in the database forever

### How to Seed Products (First Time Setup)

After your deployment succeeds:

```bash
cd medusa-v2
railway run npm run seed
```

This runs the seed script against your production database. The products get created and stay there permanently.

**What the seed creates:**
- Default sales channel
- Default region (United States)
- Default shipping profile
- Stock location
- Publishable API key
- Your products (consultations)

### How to Add Products in the Future

The seed script is only for initial setup. After that:

| Method | When to Use |
|--------|-------------|
| Admin UI | Day-to-day product management |
| Admin API | Programmatic updates |
| One-time script | Bulk imports or special migrations |

**Using Admin UI:**
1. Go to your app's `/admin/products` page
2. Create, edit, delete products through the interface

**Using Admin API:**
```bash
curl -X POST https://your-medusa.railway.app/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Product", ...}'
```

### Seed Script Location

The seed script lives at: `medusa-v2/src/scripts/seed.ts`

If you need to modify what gets seeded:
1. Edit the seed script
2. Run it manually: `railway run npm run seed`

### Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│ FIRST TIME SETUP                                                │
│                                                                 │
│ 1. Deploy (push code)                                           │
│ 2. Wait for "Deployment successful"                             │
│ 3. Run seed ONCE: cd medusa-v2 && railway run npm run seed      │
│ 4. Done! Products are in database forever                       │
├─────────────────────────────────────────────────────────────────┤
│ FUTURE DEPLOYS                                                  │
│                                                                 │
│ 1. Push code                                                    │
│ 2. That's it! Products already exist                            │
├─────────────────────────────────────────────────────────────────┤
│ ADDING NEW PRODUCTS                                             │
│                                                                 │
│ Use Admin UI or API - NOT the seed script                       │
└─────────────────────────────────────────────────────────────────┘
```

## What Works

| Feature | Status |
|---------|--------|
| `/health` endpoint | ✅ Working |
| `/store/*` API | ✅ Working |
| `/admin/*` API | ✅ Working |
| `/app` Admin Dashboard | ❌ Disabled |

## What Does NOT Work (And Why)

### ❌ Building during Docker phase + running from `.medusa/server`

**The "official" Medusa pattern:**
```bash
# Build phase
npm run build

# Start command
cd .medusa/server && npm install && npm run predeploy && npm run start
```

**Why it fails:** The `npm install` in `.medusa/server` takes 2+ minutes, exceeding Railway's healthcheck timeout.

### ❌ Building during Docker phase (Nixpacks)

**What we tried:**
```toml
[phases.build]
cmds = ["npm run build"]
```

**Why it fails:** Nixpacks does `COPY . /app` AFTER the build step, which overwrites the `.medusa/` directory with source files. The build output is lost.

### ❌ Admin enabled (`DISABLE_MEDUSA_ADMIN=false`)

**Why it fails:** When admin is enabled, `medusa start` looks for admin files at `.medusa/admin/index.html`. But:
- If we build at runtime, files go to `.medusa/server/public/admin/`
- `medusa start` from project root looks in wrong location
- Error: "Could not find index.html in the admin build directory"

## The Working Pattern Explained

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Nixpacks install phase: npm install --legacy-peer-deps       │
│    (installs all dependencies to node_modules/)                 │
├─────────────────────────────────────────────────────────────────┤
│ 2. Nixpacks build phase: echo 'Build at runtime'                │
│    (skip - we build at startup instead)                         │
├─────────────────────────────────────────────────────────────────┤
│ 3. Container starts, runs start command:                        │
│    npm run build     → Creates .medusa/server/ (~25s)           │
│    medusa db:migrate → Runs migrations (~10s)                   │
│    medusa start      → Starts server (immediate)                │
├─────────────────────────────────────────────────────────────────┤
│ 4. Healthcheck hits /health within 300s timeout                 │
│    Total startup: ~45 seconds ✓                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** Building at runtime works because the `.medusa/` folder persists within the same container session. The Nixpacks COPY problem only affects the Docker build phase.

## Admin Dashboard Options

Since admin doesn't work on Railway, you have these options:

### Option 1: Local Admin (Recommended for Development)
```bash
cd medusa-v2
npx medusa develop
# Admin at http://localhost:9000/app
```

### Option 2: Separate Admin Deployment (Vercel)
```bash
# Build admin only
npx medusa build --admin-only

# Deploy .medusa/admin/ to Vercel
# Set MEDUSA_BACKEND_URL to your Railway URL
```

### Option 3: Medusa Cloud
Use Medusa's managed hosting which handles admin properly.

## Troubleshooting

### Error: "Could not find index.html in admin build directory"

**Cause:** Admin is enabled but files don't exist in expected location.

**Fix:** Set `DISABLE_MEDUSA_ADMIN=true` in Railway variables.

### Error: "Cannot find module '/app/medusa-config'"

**Cause:** TypeScript not compiled - build didn't run.

**Fix:** Ensure start command begins with `npm run build`.

### Healthcheck fails after 2 minutes

**Cause:** Startup taking too long.

**Possible causes:**
1. `npm install` running at startup (don't do this)
2. Build failing silently
3. Database connection issues

**Fix:** Check deploy logs for errors.

### Server starts but external requests fail

**Cause:** `HOST` not set.

**Fix:**
```bash
railway variables --set "HOST=0.0.0.0"
```

Medusa defaults to `localhost` which doesn't accept external connections.

## Comparison: v1 vs v2

| Aspect | Medusa v1 | Medusa v2 |
|--------|-----------|-----------|
| Config | `medusa-config.js` | `medusa-config.ts` |
| Build | Not required | Required |
| Migrations | `medusa migrations run` | `medusa db:migrate` |
| Admin | Separate or disabled | Built-in (but problematic on Railway) |
| Start cmd | `medusa migrations run && medusa start` | `npm run build && medusa db:migrate && medusa start` |

## Files Changed From Default

When you run `create-medusa-app`, modify these files:

### `medusa-config.ts`
- Load env from root `.env.local` (if using monorepo)
- Add `admin.disable` config
- Handle DATABASE_URL construction from Supabase vars

### `nixpacks.toml` (create new)
- Skip Docker build phase
- Set start command

### `railway.json` (create new)
- Configure healthcheck
- Set start command

## Quick Setup Checklist

1. [ ] Create medusa-v2 with `npx create-medusa-app@latest`
2. [ ] Configure `medusa-config.ts` to load env vars
3. [ ] Create `nixpacks.toml` with working pattern
4. [ ] Create `railway.json` with healthcheck config
5. [ ] Set Railway env vars:
   - [ ] `HOST=0.0.0.0`
   - [ ] `DISABLE_MEDUSA_ADMIN=true`
   - [ ] `DATABASE_URL`
   - [ ] `JWT_SECRET`
   - [ ] `COOKIE_SECRET`
   - [ ] `ADMIN_CORS`
   - [ ] `STORE_CORS`
6. [ ] Push to trigger deployment
7. [ ] Verify `/health` returns OK

## References

- [Medusa v2 Docs](https://docs.medusajs.com/v2)
- [Medusa Build Command](https://docs.medusajs.com/learn/build)
- [Railway Nixpacks](https://nixpacks.com/)
- [MedusaJS Railway Boilerplate](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate)

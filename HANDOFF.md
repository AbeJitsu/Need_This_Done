# Handoff: Medusa Product Seeding Issue

## Goal
Get consultation products to appear on the shop page at https://needthisdone.com/shop

## The Problem
The production shop page returns HTTP 200 but shows no products because the Medusa database is empty. We need to automatically seed 3 consultation products when Medusa starts.

## What We're Trying to Seed
3 consultation products:
- **15-Minute Consultation** - $20.00 (Video Call)
- **30-Minute Consultation** - $35.00 (Video Call)
- **55-Minute Consultation** - $50.00 (Video Call)

Each product needs:
- Metadata: `requires_appointment: true`, duration, timezone
- 1 variant: "Video Call"
- Pricing in USD
- Associated with a region (US)

## Current Environment
- **Medusa version**: 1.20.11 (v1, not v2)
- **Database**: PostgreSQL (via docker-compose)
- **Next.js**: App Router with React Server Components
- **Deployment**: DigitalOcean droplet via Docker Compose

## What We've Tried (All Failed)

### Attempt 1: TypeScript Seed with Medusa CLI
**Files**: `medusa/src/seeds/seed.ts`, `medusa/src/seeds/consultation-products.ts`
**Command**: `npm run seed` → `medusa seed -f src/seeds/seed.ts`
**Result**: ❌ Failed
```
SyntaxError: Unexpected token '/', "// ======="... is not valid JSON
```
**Why it failed**: Medusa CLI `medusa seed` expects JSON files, not TypeScript

### Attempt 2: TypeScript Bootstrap with `createMedusaContainer()`
**File**: `medusa/src/seeds/run-seed.ts`
**Approach**: Create a TypeScript script that initializes Medusa container and calls seed function
**Command**: `npx ts-node src/seeds/run-seed.ts`
**Result**: ❌ Failed
```
TSError: '"@medusajs/medusa"' has no exported member named 'createMedusaContainer'
```
**Why it failed**: Function doesn't exist in Medusa v1

### Attempt 3: TypeScript Bootstrap with Medusa Loaders
**File**: `medusa/src/seeds/run-seed.ts` (updated)
**Approach**: Use same pattern as Medusa CLI seed command
```typescript
import express from "express";
import loaders from "@medusajs/medusa/dist/loaders";
import seed from "./seed";

const app = express();
const { container } = await loaders({
  directory: process.cwd(),
  expressApp: app,
  isTest: false,
});
await seed(container);
```
**Result**: ❌ Failed
```
AwilixResolutionError: Could not resolve 'countryService'
```
**Why it failed**: `seed.ts` tried to resolve `countryService` and `currencyService` which don't exist in Medusa v1 (they're repositories, not services)

### Attempt 4: JSON Seed File
**File**: `medusa/data/seed.json`
**Approach**: Use JSON format as Medusa CLI expects
**Command**: `medusa seed -f data/seed.json`
**Result**: ❌ Failed
```
TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
    at __values (/app/node_modules/@medusajs/medusa/dist/commands/seed.js:73:72)
```
**Why it failed**: JSON structure may be missing required fields, or Medusa v1 seed command has a bug

## Current File State

### Files Modified/Created:
1. **medusa/docker-entrypoint.sh** - Runs seed on startup, verifies products exist
2. **medusa/data/seed.json** - JSON seed file (currently failing)
3. **medusa/src/seeds/seed.ts** - TypeScript seed (uses non-existent services)
4. **medusa/src/seeds/run-seed.ts** - Bootstrap script (works until seed.ts fails)
5. **medusa/package.json** - Updated seed script to `medusa seed -f data/seed.json`
6. **medusa/Dockerfile** - Copies `data/seed.json` into image

### Key File: docker-entrypoint.sh Flow
```bash
1. Verify environment variables
2. Run migrations: npm run migrate
3. Seed database: npm run seed (if data/seed.json exists)
4. Verify products exist (query database)
5. Start Medusa: npm start
```

## Technical Questions Needing Answers

1. **What is the correct JSON structure for `medusa seed` in v1.20.11?**
   - Our current JSON has: store, regions, products
   - Error suggests something is `undefined` when iterating
   - Need official v1 seed.json example

2. **Which services actually exist in Medusa v1.20.11?**
   - Confirmed NOT available: `countryService`, `currencyService`
   - Confirmed available: `storeService`, `regionService`, `productService`
   - Are countries/currencies managed differently?

3. **Should we use TypeScript seed or JSON seed for Medusa v1?**
   - Official docs say both are supported
   - Our TypeScript approach fails due to missing services
   - Our JSON approach fails with iteration error

4. **Is there a working Medusa v1 seed example for consultation/service products?**
   - Most examples are for physical products
   - Need pattern for non-shippable, appointment-based products

## Relevant Medusa v1 Documentation Needed

Please fetch these docs:
- Medusa v1 seeding guide (NOT v2)
- `medusa seed` CLI command reference
- Available services in Medusa v1 container
- Example seed.json files from official v1 starters
- Product seeding for non-physical/service products

## Alternative: Upgrade to Medusa v2?

**Context**: Medusa v2 has been stable since October 2024 (over 1 year)
**Current**: We're on v1.20.11 (maintenance mode, no active development)

**Pros of upgrading:**
- Actively developed, better docs
- Modern architecture (MikroORM vs TypeORM)
- Better admin UI
- We're early in the project (minimal custom integrations)

**Cons:**
- Migration effort
- Need to update all configurations
- Different API patterns

## Next Steps (Pick One Path)

### Path A: Fix Medusa v1 Seeding
1. Research correct JSON seed format for Medusa v1.20.11
2. Find which field is causing the `undefined is not iterable` error
3. Fix JSON structure
4. Test locally
5. Deploy to production

### Path B: Upgrade to Medusa v2
1. Research Medusa v2 setup
2. Create new v2 backend configuration
3. Migrate database schema (or start fresh)
4. Update Next.js integration for v2 API
5. Deploy to production

## Testing the Fix

Once seeding works:
```bash
# Local test
npm run dev:start
# Wait for containers
# Visit https://localhost/shop
# Should see 3 products

# Production test
ssh root@159.65.223.234
cd /root/Need_This_Done
git pull origin main
npm run prod:build
npm run prod:start
# Visit https://needthisdone.com/shop
```

## Contact/Context
- Shop page Next.js code: `app/app/shop/page.tsx`
- Medusa client: `app/lib/medusa-client.ts`
- Products load via: `medusaClient.products.list()`
- Server: DigitalOcean at 159.65.223.234

## Summary
We've tried 4 different approaches to seed products into Medusa v1, all have failed due to either:
1. Medusa CLI not supporting TypeScript
2. Non-existent services in v1
3. Incorrect JSON structure

Need official Medusa v1 documentation or examples to determine the correct seeding approach, OR consider upgrading to v2 since it's been stable for over a year.

# Claude Code Instructions

## IFCSI Framework

When writing anything—cover letters, proposals, marketing copy, even commit messages—move through these five tones in order:

1. **Inviting** — Start with something that makes them want to keep reading. Show you actually care about what they said.
2. **Focused** — Get to the point. What specifically do you bring? No fluff, just the good stuff.
3. **Considerate** — Show you understand *their* situation. What are they dealing with? What do they need?
4. **Supportive** — Back it up. Real examples, real results. This is where you prove it's not just talk.
5. **Influential** — Land the plane. What's the next step? Make it easy for them to say yes.

Think of it like a good conversation: you don't start by asking for something, and you don't end without making it clear what happens next.

**Avoid the Four Horsemen:**

- **Contempt** — No sarcasm, eye-rolling tone, or "that's obvious" energy
- **Criticism** — Address situations, not character. "This approach has issues" not "you did this wrong"
- **Defensiveness** — Don't over-explain or justify. State facts simply and move on.
- **Stonewalling** — Don't dodge hard topics. Address them directly but briefly.

Speak like a friend over coffee. Easy to understand.

## Quick Reference

| Task                    | Command                         |
| ----------------------- | ------------------------------- |
| Start dev server        | `cd app && npm run dev`       |
| Run all tests           | `cd app && npm run test:e2e`  |
| Run accessibility tests | `cd app && npm run test:a11y` |
| Start Storybook         | `cd app && npm run storybook` |
| Understand codebase     | Read `README.md`              |
| Draft a commit          | Run `/dac`                    |
| Check work status       | Run `/check-work`             |

## How to Work

1. Check **README.md** for how things work
2. Run `cd app && npm run dev` to start
3. Run `/dac` to draft commits (never commit directly)

## Terminal

Chain commands: `cmd1 && cmd2 && cmd3`

## Communication

Use ASCII charts for complex flows. Keep them simple.

## Environment Tips

- **Frontend app** is in `/app` directory
- **Supabase** migrations in `/supabase/migrations`
- **Medusa backend** in `/medusa` (deployed on Railway)
- **Environment variables** in `.env.local` (see README.md for required vars)

## Backend Reliability Helpers

**Location:** `/app/lib/`

Key utilities for production-grade reliability:

| File | Purpose |
|------|---------|
| `supabase-retry.ts` | Auto-retry wrapper for transient DB failures (3 attempts, exponential backoff) |
| `request-dedup.ts` | Prevents duplicate form submissions (SHA-256 fingerprinting, 60s TTL) |
| `api-timeout.ts` | Timeout protection for external APIs (8s external, 10s DB, 2s cache) |
| `api-validation.ts` | Zod schema validation middleware for type-safe API routes |
| `validation.ts` | Input sanitization (email, file paths, length limits) |
| `redis.ts` | Circuit breaker pattern with graceful degradation |

See `memory/context/decisions.md` for implementation rationale.

## Deployment Guidelines

**Vercel Configuration:**
- **CRITICAL:** Always add a root `vercel.json` with proper build commands when deployment fails
- **Build Command:** `cd app && npm run build`
- **Install Command:** `cd app && npm install` 
- **Dev Command:** `cd app && npm run dev`
- **Output Directory:** `app/.next`
- **Framework:** `nextjs`

**Environment Variables Required for Deployment:**
- Copy `app/.env.example` to verify all required environment variables are set in Vercel dashboard
- Missing environment variables are the #1 cause of Vercel deployment failures
- Always check Vercel logs for "ReferenceError: [VARIABLE] is not defined"

**Common Deployment Fixes:**
1. Ensure `vercel.json` exists in project root (not in `/app`)
2. Verify all environment variables from `.env.example` are set in Vercel
3. Check build logs for missing dependencies or configuration errors
4. Confirm Next.js config has proper `output: 'standalone'` setting

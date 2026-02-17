# Backend Eval — APIs, Security, Error Handling

You are auditing NeedThisDone.com's backend code for reliability and security issues.

## Setup

1. Read `/CLAUDE.md` and `/app/lib/CLAUDE.md` for project conventions
2. Read `/.claude/rules/coding-standards.md` for naming and organization rules

## Scope

Focus on these directories:
- `app/app/api/` — API routes
- `app/lib/` — Server-side utilities and clients
- `supabase/migrations/` — Database migrations and RLS policies

## What to Check

### API Route Quality
- All admin routes use `verifyAdmin()` for authorization
- Error responses use `handleApiError()` or structured error objects
- Request validation with Zod schemas at API boundaries
- Timeout protection via `withTimeout()` for external calls

### Reliability Patterns
- Supabase operations use `withWebhookRetry()` where transient failures are possible
- Fire-and-forget promises ALWAYS have `.catch()` handlers
- Cache operations are non-blocking (failure doesn't break main flow)
- Rate limiting on public-facing endpoints

### Security
- No SQL injection vectors (parameterized queries via Supabase client)
- No hardcoded secrets or credentials
- Input sanitization at API boundaries
- RLS policies in migrations match expected access patterns

### Medusa Integration
- Products fetched from Medusa, never hardcoded
- Cart operations go through Medusa client
- Subscriptions flow through Medusa checkout, not direct Stripe

## Rules

- Fix 3-5 issues maximum per run
- Run `cd app && npm run test:unit` before committing
- Commit to `dev` branch only
- Append fixes to `.nightly-eval-fixes.md` in project root
- Do NOT add new features — only fix existing issues

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

## Subfolder CLAUDE.md Pattern

Major subfolders have their own CLAUDE.md files for domain-specific knowledge:

- **`/supabase/CLAUDE.md`** - Database conventions, migration patterns, RLS security, Supabase CLI
- **`/app/CLAUDE.md`** - Frontend patterns, Next.js conventions, component architecture
- **`/medusa/CLAUDE.md`** - Backend API patterns, Medusa conventions (when needed)
- **`/scripts/CLAUDE.md`** - Automation scripts, seed data patterns

**Why:** Keeps context local to where work happens. Database learnings stay near migrations, frontend patterns near components.

**When working in a subfolder:** Always read that folder's CLAUDE.md first to understand local conventions.

## Quick Reference

| Task                    | Command                         |
| ----------------------- | ------------------------------- |
| Start dev server        | `cd app && npm run dev`       |
| Run all tests           | `cd app && npm run test:e2e`  |
| Run accessibility tests | `cd app && npm run test:a11y` |
| Build for production    | `cd app && npm run build`     |
| Understand codebase     | Read `README.md`              |
| Draft a commit          | Run `/dac`                    |
| Check work status       | Run `/check-work`             |

**⚠️ CRITICAL:** After running `npm run build`, the dev server must be **killed and restarted**. The build clobbers the `.next` directory, which breaks an already-running dev server. Kill it with `Ctrl+C` and run `cd app && npm run dev` again.

## What's Built

**Database Security Hardening (Feb 13-14, 2026):**
- ✅ **Migration 055**: Fixed 168 Supabase linter errors (RLS policies, admin role system, view security, token encryption)
- ✅ **Test Suite**: 40+ TDD tests for RLS, admin functions, token encryption, view security
- ✅ **Documentation**: Architecture guide, PostgreSQL security guide, Docker setup guide, environment guide (1,840+ lines)
- ✅ **Seed Data**: Local development seed with admin user, categories, blog posts
- ✅ **Verification Reports**: 4 comprehensive reports documenting project status and deployment readiness

**Latest additions (Feb 12, 2026):**
- ✅ **Pricing FAQ sync**: Replaced 6 hardcoded FAQ items on `/pricing` with 3 conversion-focused Q&As + link to `/faq`
- ✅ **Features page removed**: `/features/flow-automation` preserved on `experiment/features` branch, removed from `dev`. Nav updated.

**Earlier (Feb 6, 2026):**
- ✅ **Workflow Automation System (Phase 1A)**: React Flow visual builder, BullMQ engine, 12 triggers, 7 actions, 8 operators, Zod validation, CRUD API, test runs. Admin at `/admin/automation/builder`.

**Earlier today (Feb 6, 2026 – Morning):**
- ✅ **Workflow Automation System (Phase 1A)**: Visual drag-and-drop workflow builder with React Flow canvas, 12 trigger types, 7 action types, 8 condition operators, BullMQ async execution engine, test run preview, Zod validation, and full CRUD API
- ✅ **Shopify Plus Roadmap**: Strategic roadmap for building feature parity with Shopify Plus ($2,500/mo platform)

**Previous additions (Feb 2, 2026):**
- ✅ **Customer loyalty points system**: Earn 1 point per \$1 spent, redeem 100+ points for discounts at checkout with admin analytics (commit 6ef1f17)
- ✅ **Build blockers fixed**: Supabase/Resend client initialization moved from module to handler level (16 routes), <img> tag warnings resolved (commit b5cfd40)
- ✅ **Admin API hardening**: Standardized admin auth checks, campaign deduplication, N+1 query protection (commit a6a242f)
- ✅ **Recently viewed products**: Browse history tracking + widget on shop page (commit af0557c)
- ✅ **Customer referral program**: Earn \$10 store credits for each successful referral with unique code, real-time tracking, and credit balance management
- ✅ **Admin communication hub**: Create email templates, build targeted campaigns to customer segments, track open/click rates and delivery status
- ✅ **Email segmentation for waitlist members**: Create targeted campaigns with performance analytics and one-click sending
- ✅ **Waitlist analytics dashboard**: Real-time demand metrics, conversion tracking, top products, signup trends
- ✅ **Product category management**: Admin CRUD for categories with color-coding and custom ordering
- ✅ **Product comparison tool**: Side-by-side comparison modal for up to 4 products
- ✅ **Order notes**: Customers add special requests/delivery instructions at checkout
- ✅ **Saved addresses**: CRUD management in account settings with default address support
- ✅ **Spending analytics**: Customer spending visualization with time-based aggregation
- ✅ **Waitlist notifications**: Automated emails when out-of-stock products return to inventory
- ✅ **Product category filtering**: Browse products by category with admin-controlled dropdown
- ✅ **Product waitlist system**: Sign up for out-of-stock items with email capture
- ✅ **Product availability display**: Shows stock status with waitlist form
- ✅ **Customer dashboard**: Active appointments + statistics overview
- ✅ **Order management**: History, quick reorder, CSV export, invoices, timeline
- ✅ **Review system**: Admin moderation, analytics, notification emails
- ✅ **Account settings**: Profile, addresses, notification preferences, review tracking
- ✅ **Admin dashboards**: Reviews, analytics, appointments, product insights, waitlist, categories, referrals, email campaigns, loyalty
- ✅ **Backend reliability**: Connection pooling, retries, validation, circuit breaker, rate limiting

**Backend Reliability (Feb 2 Audit - 8 Critical Fixes):**
- ✅ **Connection pooling**: Singleton Supabase client handles 100+ concurrent requests
- ✅ **Async/await safety**: Fixed fire-and-forget bugs in appointment flow
- ✅ **Email failure logging**: Tracks delivery issues for recovery workflows
- ✅ **Form upload timeout**: 30s graceful failure to prevent hangs
- ✅ **Rate limiting**: Auth endpoints protected (5 login/3 signup per 15 min)
- ✅ **Request deduplication**: SHA-256 fingerprinting with Redis circuit breaker
- ✅ **Authorization hardening**: Added checks on all admin routes
- ✅ **Environment validation**: Required vars checked at startup

See **memory/MEMORY.md** for full feature inventory and **FUNCTIONALITY_EVALUATION_FIXES.md** for reliability fixes.

## Commit Quality Standard

**Only commit features when they are tested and documented to work.**

### Test-Driven Development for Database Migrations

For database security/schema changes:

1. **RED:** Write tests that FAIL with current schema
   ```bash
   # Test file: supabase/tests/security-hardening.test.ts
   npm test supabase/tests/  # Should FAIL
   ```

2. **GREEN:** Run migration to make tests pass
   ```bash
   supabase db reset  # Applies all migrations
   npm test supabase/tests/  # Should PASS
   supabase db lint  # Expected: 0 errors
   ```

3. **VERIFY:** Check migration applies cleanly to fresh database
   ```bash
   supabase db reset && supabase db lint
   ```

**Pattern:** Test structure for database security:
- Section helpers (isRLSEnabled, getTablePolicies, runSupabaseLint)
- Admin/anon client fixtures for RLS testing
- Behavioral tests (policies actually work, not just exist)

### Before Every Commit

```bash
# 1. Run relevant tests
npm run test:e2e          # Frontend features
npm run test:a11y         # UI components
npm test security-*.test  # Database changes (in supabase/tests/)

# 2. Verify feature works manually
cd app && npm run dev
# Click through the feature, verify behavior

# 3. For database changes: verify lint passes
cd .. && supabase db lint
# Expected: 0 errors

# 4. THEN draft commit
/dac
```

### Commit Checklist

- [ ] Tests pass (automated)
- [ ] Feature works (manual verification)
- [ ] No lint errors (if database changes)
- [ ] Code follows patterns in relevant CLAUDE.md
- [ ] Breaking changes documented (if any)

**If you can't check all boxes, don't commit yet.**

### Multi-Phase Project Pattern

For projects with distinct phases (e.g., Security Hardening Phases 1-4):

1. **Create branch:** `git checkout -b feature-name`
2. **Phase 1:** Write code + tests, commit with `/dac`, push
3. **Delegate Phases 2-4:** Launch parallel subagents with `run_in_background: true`
   - Phase 2: Task #1 → creates deliverables
   - Phase 3: Task #2 → creates deliverables
   - Phase 4: Task #3 → creates deliverables
4. **Monitor:** Read subagent output files periodically with `tail`
5. **Coordinate:** Pull results, update root CLAUDE.md with learnings
6. **Final commit:** Verify all deliverables, commit as single PR

**Why:** Preserves context by parallelizing work. Haiku subagents cost less. All work coordinated at root level.

## How to Work

1. Check **memory/MEMORY.md** for project status and features
2. Run `cd app && npm run dev` to start the dev server
3. Run `/dac` to draft commits (only after tests pass and feature works)

**Important Dev Server Notes:**
- Dev server runs on port 3000 (`http://localhost:3000`)
- After running `npm run build`, **restart the dev server** — the build clobbers `.next` and breaks rendering
- To restart: kill with `Ctrl+C`, then run `cd app && npm run dev` again

### Multi-Phase Projects & Context Preservation

For projects spanning 4+ phases or at 50%+ token usage, create `SESSION_CHECKPOINT.md` in relevant subfolder:

```markdown
# Session Checkpoint - YYYY-MM-DD

**Status:** Phases 1-3 complete. Phase 4 in progress.

## What's Done
- Phase 1: [deliverables] (commit SHA)
- Phase 2: [deliverables] (commit SHA)
- Phase 3: [deliverables] (commit SHA)

## What's Next
1. [Step 1]
2. [Step 2]

## Git Commands for Continuation
git log --oneline -10
git show <commit>
```

**Why:** Allows context compaction without losing project state. Next session reads checkpoint + git log to resume.

## Subagent Usage

Use **haiku** subagents for straightforward tasks (file searches, simple code generation, boilerplate) to save tokens. Reserve **sonnet/opus** for tasks requiring deep reasoning, complex architecture decisions, or nuanced writing.

### Background Task Execution

Use `run_in_background: true` for long-running tasks (Docker setup, test suites, verification):

```javascript
// Launch task in background
const result = await Task({
  subagent_type: "Bash",
  run_in_background: true,
  model: "haiku",  // Cost efficiency
  prompt: "..."
});

// Returns immediately with output_file path
// Check progress later: Read or Bash tail on /private/tmp/.../tasks/{agentId}.output
// Continue with other work while task runs
```

**Pattern:** Launch 2+ independent background tasks, then do foreground work (like updating CLAUDE.md) in parallel. Subagents return output file you can read later.

## Terminal

Chain commands: `cmd1 && cmd2 && cmd3`

### Skill Usage Patterns

**Invoke skills BEFORE significant work for:**
- `superpowers:test-driven-development` — Before writing any code/migrations
- `superpowers:writing-plans` — Before multi-phase projects
- `claude-md-management:revise-claude-md` — When updating CLAUDE.md with learnings
- `superpowers:dispatching-parallel-agents` — Before launching 2+ independent background tasks

**Order matters:** Read skill content, then follow it exactly. Skills guide implementation approach.

## Communication

Use ASCII charts for complex flows. Keep them simple.

## Environment Tips

- **Frontend app** is in `/app` directory
- **Supabase** migrations in `/supabase/migrations`
- **Medusa backend** in `/medusa` (deployed on Railway)
- **Environment variables** in `.env.local` (see README.md for required vars)

## Product & Pricing Management

**CRITICAL: All products are managed through Medusa. Never hardcode product data.**

| Task | How |
|------|-----|
| Add/edit products | Edit `scripts/seed-products.ts`, run `npx tsx scripts/seed-products.ts` |
| Fetch products | Use `/api/pricing/products` endpoint |
| Add to cart | Use `CartContext.addItem(variantId, quantity)` |
| Product types | `package`, `addon`, `service`, `subscription` (in metadata) |

```
Source of truth: Medusa → API → Frontend
Never: Hardcoded arrays in React components
```

See `.claude/rules/medusa-products.md` for full details.

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

See **memory/MEMORY.md** "Backend Reliability Patterns" section for details.

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

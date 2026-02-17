# Claude Code Instructions

## Subfolder CLAUDE.md Pattern

Major subfolders have their own CLAUDE.md files for domain-specific knowledge:

- **`/supabase/CLAUDE.md`** — Database conventions, migration patterns, RLS security, Supabase CLI
- **`/app/lib/CLAUDE.md`** — Library utilities, Medusa/Stripe clients, reliability helpers
- **`/app/scripts/CLAUDE.md`** — Seed scripts, automation patterns

**When working in a subfolder:** Always read that folder's CLAUDE.md first.

## Quick Reference

| Task                    | Command                       |
| ----------------------- | ----------------------------- |
| Start dev server        | `cd app && npm run dev`       |
| Run all tests           | `cd app && npm run test:e2e`  |
| Run accessibility tests | `cd app && npm run test:a11y` |
| Build for production    | `cd app && npm run build`     |
| Understand codebase     | Read `README.md`              |
| Draft a commit          | Run `/dac`                    |
| Check work status       | Run `/check-work`             |
| Run auto-eval           | `tsx automations/run-eval.ts` |

**CRITICAL:** After `npm run build`, the dev server must be **killed and restarted** — build clobbers `.next`.

## Domain Rules Index

Key rules in `.claude/rules/`:

| File | Covers |
|------|--------|
| `design.md` | Brand identity, BJJ belt colors, WCAG AA, visual effects |
| `medusa-products.md` | Product management, cart flow, subscriptions |
| `tdd.md` | Test-driven development cycle |
| `testing-flexibility.md` | Test types, when to run what, test architecture |
| `coding-standards.md` | Naming, TypeScript, file organization |
| `commit-often.md` | Commit hygiene |
| `hero-gradients.md` | Centered gradient pattern for hero sections |
| `inline-editing-state.md` | Inline edit sync bug patterns |
| `etc-easy-to-change.md` | ETC principle, DRY, changeability |
| `quality.md` | Zero warnings policy |
| `pr-verification.md` | PR verification decision tree |

## How to Work

1. Check **memory/MEMORY.md** for project status
2. Run `cd app && npm run dev` to start the dev server
3. Run `/dac` to draft commits (only after tests pass and feature works)

**Dev server** runs on port 3000. After `npm run build`, restart it.

## Subagent Usage

Use **haiku** subagents for straightforward tasks (file searches, simple code generation, boilerplate). Reserve **sonnet/opus** for deep reasoning, complex architecture, or nuanced writing.

Use `run_in_background: true` for long-running tasks (Docker setup, test suites, verification).

### Skill Usage Patterns

**Invoke skills BEFORE significant work for:**
- `superpowers:test-driven-development` — Before writing code/migrations
- `superpowers:writing-plans` — Before multi-phase projects
- `claude-md-management:revise-claude-md` — When updating CLAUDE.md
- `superpowers:dispatching-parallel-agents` — Before launching 2+ background tasks

## Auto-Eval System

Automated codebase audits in `automations/`. Spawns Claude Code sessions that review and fix issues.

| Command | What it does |
|---------|-------------|
| `tsx automations/run-eval.ts` | Auto-rotate through 4 eval types |
| `tsx automations/run-eval.ts --type frontend` | Run specific eval type |
| `tsx automations/run-eval.ts --dry-run` | Preview prompt without running |

**Eval types:** `frontend` (UI/a11y), `backend` (APIs/security), `functionality` (tests/features), `memory` (docs/CLAUDE.md accuracy)

**Scheduling:** launchd runs every 4 hours. Install: `cd automations/launchd && ./install.sh install`

**Key files:** `automations/run-eval.ts` (runner), `automations/prompts/*.md` (templates), `automations/launchd/` (scheduling)

## Workflow Automation

The workflow engine (BullMQ + React Flow + Supabase) initializes on server boot via `app/instrumentation.ts`. Requires `WORKFLOW_ENGINE_ENABLED=true` in env.

**Events emitted from production code:**
- `order.placed` — Stripe webhook after payment success
- `customer.signup` — Auth signup after account creation
- `order.fulfilled` / `order.cancelled` — Admin order status changes
- `product.out_of_stock` / `inventory.low_stock` — Inventory updates

**Key files:** `app/lib/workflow-engine.ts` (engine), `app/lib/workflow-events.ts` (event bus), `app/instrumentation.ts` (startup)

## Environment Tips

- **Frontend app** is in `/app` directory
- **Supabase** migrations in `/supabase/migrations`
- **Medusa backend** in `/medusa` (deployed on Railway)
- **Automations** in `/automations` (standalone CLI, not part of web app)
- **Environment variables** in `.env.local` (see README.md for required vars)

## Communication

Use ASCII charts for complex flows. Keep them simple. Chain commands: `cmd1 && cmd2 && cmd3`.

## Deployment Guidelines

**Vercel Configuration:**
- **CRITICAL:** Always add a root `vercel.json` with proper build commands when deployment fails
- **Build Command:** `cd app && npm run build`
- **Install Command:** `cd app && npm install`
- **Output Directory:** `app/.next`
- **Framework:** `nextjs`

**Environment Variables Required for Deployment:**
- Copy `app/.env.example` to verify all required vars are set in Vercel
- Missing environment variables are the #1 cause of deployment failures
- Check Vercel logs for "ReferenceError: [VARIABLE] is not defined"

**Common Deployment Fixes:**
1. Ensure `vercel.json` exists in project root (not in `/app`)
2. Verify all environment variables from `.env.example` are set
3. Check build logs for missing dependencies
4. Confirm Next.js config has `output: 'standalone'`

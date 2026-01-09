# Skills & Commands Reference

Document for testing and evaluating all skills and commands.

## Quick Reference

| Name | Type | Trigger | Status | Notes |
|------|------|---------|--------|-------|
| dac | Command | `/dac` | WORKS | Auto-commits with IFCSI messages |
| check-work | Command | `/check-work` | ? | Git status overview |
| document | Command | `/document` | ? | Screenshot + changelog |
| page-audit | Command | `/page-audit` | ? | A11y/dark mode checker |
| frontend-design | Skill | Describe UI task | ? | Creative frontend code |
| launch-a-swarm | Skill | "launch a swarm" | ? | 5 parallel quality agents |
| think-ahead | Skill | "think ahead" | ? | Strategic planning |
| worktree-swarm | Skill | Parallelize task | ? | Git worktree orchestration |
| screenshot-workflow | Skill | "screenshot workflow" | ? | Visual regression 150+ pages |
| pragmatic-audit | Skill | "pragmatic audit" | ? | Code quality scanner |

---

## Commands (in `.claude/commands/`)

### /dac - Draft a Commit
**Trigger:** `/dac`
**What it does:** Analyzes git changes, drafts commit message using IFCSI tone, auto-commits small changes.
**Status:** WORKS - tested multiple times this session
**Key behaviors:**
- Auto-stages if nothing staged
- Auto-commits if <150 lines, single-purpose, no secrets
- Uses prefixes: Add, Fix, Docs, Test, Config, Refactor, Remove
- Never adds Claude Code signature

### /check-work - Check Work Status
**Trigger:** `/check-work`
**What it does:** Runs git commands to show current state, staged/unstaged changes, recent commits.
**Status:** NOT TESTED
**Test:** Run `/check-work` and see if it provides useful git context

### /document - Document Changes
**Trigger:** `/document`
**What it does:** Detects changed frontend files, captures screenshots, generates changelog JSON.
**Status:** NOT TESTED
**Dependencies:** Requires screenshot script (`npm run screenshot:affected`)
**Test:** Make a frontend change, run `/document`

### /page-audit - Page Audit
**Trigger:** `/page-audit /shop` or `/page-audit all`
**What it does:** Audits page against dark mode, a11y, color system, code quality standards.
**Status:** NOT TESTED
**Test:** Run `/page-audit /shop` and check if it finds real issues

---

## Skills (in `.claude/skills/`)

### frontend-design
**Trigger:** Ask to build UI/frontend
**What it does:** Creates distinctive, production-grade frontend code with bold aesthetic direction.
**Status:** NOT TESTED
**Key behaviors:**
- Chooses unique fonts (not Arial/Inter)
- Commits to aesthetic direction before coding
- Avoids "AI slop" generic patterns

### launch-a-swarm
**Trigger:** "launch a swarm"
**What it does:** Spawns 5 parallel agents checking Structure, Protection, Correctness, Evolution, Value.
**Status:** NOT TESTED
**When to use:** Planning features, validating before merge
**Test:** Say "launch a swarm" during planning phase

### think-ahead
**Trigger:** "think ahead"
**What it does:** Strategic planning partner - reads work state, spots dependencies, plans next moves.
**Status:** NOT TESTED
**When to use:** Between work cycles, before committing to a direction
**Test:** After completing a task, say "think ahead"

### worktree-swarm
**Trigger:** Ask to parallelize across agents
**What it does:** Sets up git worktrees for parallel Claude Code agents, manages merging.
**Status:** NOT TESTED
**When to use:** Independent modules, separate file domains
**Test:** Ask to split a feature across multiple agents

### screenshot-workflow
**Trigger:** "screenshot workflow" or "visual regression"
**What it does:** Captures ALL 150+ pages across 4 variants (desktop/mobile × light/dark).
**Status:** LIKELY BROKEN - screenshot functionality has had issues
**Test:** Run "screenshot workflow" and check if it works

### pragmatic-audit
**Trigger:** "pragmatic audit" or `/pragmatic-audit`
**What it does:** Scans for Pragmatic Programmer anti-patterns: DRY, SOLID, KISS, hardcoded values, broken windows.
**Status:** NOT TESTED
**Test:** Run "pragmatic audit" and see if it finds real issues

---

## Duplicates to Resolve

| Command | Skill | Keep Which? |
|---------|-------|-------------|
| `/check-work` | `check-work/` | TBD - test both |
| `/document` | `document/` | TBD - test both |

---

## Testing Log

### Test 1: /dac
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Successfully auto-committed multiple times. Uses IFCSI tone.

### Test 2: (next test goes here)
- **Date:**
- **Result:**
- **Notes:**

---

## What We Learned

### Working Patterns
- Commands with `allowed-tools` defined work reliably
- Skills invoked via Skill tool work

### Broken Patterns
- (document as we test)

### Rules for New Skills
1. Test before deploying
2. Document what it does clearly
3. Define specific triggers
4. If it doesn't work, delete it

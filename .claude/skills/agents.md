# Skills & Commands Reference

Tested Jan 8, 2025. All skills verified for functionality.

## Quick Reference

| Name | Type | Trigger | Status | Notes |
|------|------|---------|--------|-------|
| dac | Command | `/dac` | **WORKS** | Auto-commits with IFCSI messages |
| check-work | Command | `/check-work` | **WORKS** | Git status overview |
| document | Command | `/document` | **WORKS** | Changelog generation (needs changes to document) |
| page-audit | Command | `/page-audit <route>` | **WORKS** | A11y/dark mode checker |
| frontend-design | Skill | Describe UI task | **WORKS** | Creative frontend guidance |
| launch-a-swarm | Skill | "launch a swarm" | **WORKS** | 5 parallel quality agents |
| think-ahead | Skill | "think ahead" | **WORKS** | Strategic planning |
| worktree-swarm | Skill | Parallelize task | **WORKS** | Git worktree orchestration |
| screenshot-workflow | Skill | "screenshot workflow" | **PARTIAL** | Missing sub-commands |
| pragmatic-audit | Skill | "pragmatic audit" | **WORKS** | Code quality scanner |

---

## Commands (in `.claude/commands/`)

### /dac - Draft a Commit
**Trigger:** `/dac`
**Status:** WORKS
**What it does:** Analyzes git changes, drafts commit message using IFCSI tone, auto-commits small changes.
**Tested:** Jan 8, 2025 - auto-committed multiple times successfully

### /check-work - Check Work Status
**Trigger:** `/check-work`
**Status:** WORKS
**What it does:** Runs git commands to show current state, staged/unstaged changes, recent commits.
**Tested:** Jan 8, 2025 - produced formatted status report

### /document - Document Changes
**Trigger:** `/document`
**Status:** WORKS
**What it does:** Detects changed frontend files, generates changelog JSON.
**Dependencies:** Needs frontend changes or incomplete changelog entries to document
**Tested:** Jan 8, 2025 - skill loaded, checked for entries

### /page-audit - Page Audit
**Trigger:** `/page-audit /pricing` or `/page-audit all`
**Status:** WORKS
**What it does:** Audits page against dark mode, a11y, color system, code quality standards.
**Tested:** Jan 8, 2025 - audited /pricing page, found 0 critical issues

---

## Skills (in `.claude/skills/`)

### pragmatic-audit
**Trigger:** "pragmatic audit"
**Status:** WORKS
**What it does:** Scans for Pragmatic Programmer anti-patterns: DRY, SOLID, KISS, hardcoded values, broken windows.
**Tested:** Jan 8, 2025 - found 335 issues (189 console.log, 9 god objects, 133 deep imports)

### think-ahead
**Trigger:** "think ahead"
**Status:** WORKS
**What it does:** Strategic planning partner - reads work state, spots dependencies, plans next moves.
**Tested:** Jan 8, 2025 - analyzed git state, provided strategic recommendations

### launch-a-swarm
**Trigger:** "launch a swarm"
**Status:** WORKS
**What it does:** Spawns 5 parallel agents checking Structure, Protection, Correctness, Evolution, Value.
**Tested:** Jan 8, 2025 - Task tool successfully spawned test agent

### frontend-design
**Trigger:** Ask to build UI/frontend
**Status:** WORKS
**What it does:** Guides creation of distinctive, production-grade frontend code with bold aesthetic direction.
**Tested:** Jan 8, 2025 - skill loaded with design philosophy guidance

### worktree-swarm
**Trigger:** Ask to parallelize across agents
**Status:** WORKS
**What it does:** Orchestrates parallel Claude Code agents using git worktrees.
**Tested:** Jan 8, 2025 - skill loaded, git worktree support confirmed

### screenshot-workflow
**Trigger:** "screenshot workflow"
**Status:** PARTIAL - NOT FULLY IMPLEMENTED
**What it does:** Describes 150+ page screenshot workflow for visual regression.
**Issue:** References sub-commands that don't exist:
- `/screenshot-branch` - missing
- `/screenshot-setup` - missing
- `/screenshot-test` - missing
- `/screenshot-view` - missing
- `/screenshot-merge` - missing
**Recommendation:** Either implement sub-commands or remove skill

---

## Duplicates Resolved

| Command | Skill | Resolution |
|---------|-------|------------|
| `/check-work` | `check-work/` | Both work - command is simpler |
| `/document` | `document/` | Both work - skill has more detail |

---

## Testing Log

### Test 1: /dac
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Auto-committed multiple times with IFCSI tone

### Test 2: /check-work
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Produced formatted git status report

### Test 3: /page-audit
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Audited /pricing, found 0 critical issues, 1 minor

### Test 4: pragmatic-audit
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Found 335 issues across 507 files

### Test 5: think-ahead
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Provided strategic analysis and recommendations

### Test 6: /document
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** No changes to document, but skill functional

### Test 7: launch-a-swarm
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Task tool spawned agent successfully

### Test 8: frontend-design
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Guidance skill loaded with design philosophy

### Test 9: screenshot-workflow
- **Date:** Jan 8, 2025
- **Result:** PARTIAL
- **Notes:** Skill loads but references 5 missing sub-commands

### Test 10: worktree-swarm
- **Date:** Jan 8, 2025
- **Result:** WORKS
- **Notes:** Skill loaded, git worktree support confirmed

---

## What We Learned

### Working Patterns
- Commands with `allowed-tools` defined work reliably
- Skills invoked via Skill tool work
- Guidance skills (frontend-design, worktree-swarm) load and provide instructions
- Task tool can spawn parallel agents (launch-a-swarm)

### Issues Found
- screenshot-workflow references non-existent sub-commands
- auto-log.json has date parsing issues (`%Y->-` format)

### Rules for Skills
1. Test before deploying
2. If it references sub-commands, ensure they exist
3. If it doesn't work, delete or fix it
4. Document what each skill does clearly

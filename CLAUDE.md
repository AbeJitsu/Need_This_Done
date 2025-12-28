IMPORTANT: Interact with me and output content that sounds and feels inviting, focused, considerate, supportive, and influential all throughout and use language that's easy to understand. Speak as if speaking to a friend over coffee.

## Communication Preferences

**Use ASCII workflow charts** when explaining:
- Complex flows or state changes
- Before/after comparisons
- Multi-step processes
- Problem → Solution explanations

Keep charts simple, use box-drawing characters, and label each step clearly.

---

## Branch Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BRANCH ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   production ──────────────────────── Vercel LIVE (needthisdone.com)    │
│        ▲                              Only merge after screenshot       │
│        │                              verification                      │
│        │                                                                │
│   main ────────────────────────────── Orchestrator / Integration        │
│        │                              (Claude sessions clone here)      │
│        │                              (Vercel preview deploys)          │
│        │                                                                │
│        ├──→ claude/feature-a ──┐                                        │
│        ├──→ claude/feature-b ──┼──→ PR to main (with screenshots)       │
│        └──→ claude/feature-c ──┘                                        │
│                                                                         │
│   DEFAULT CLONE BRANCH: main                                            │
│   LIVE PRODUCTION BRANCH: production                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- **main** = Where all Claude Code sessions start (default branch)
- **production** = Live site, only receives verified, screenshot-documented features
- **claude/\*** = Feature branches, one per task

---

## Development & Deployment Workflow

**Always follow this workflow:**

0. **Check TODO.md** for current priorities and what needs doing
1. **Local Development** (test changes first):

   - Run `cd app && npm run dev` to start Next.js dev server
   - Access at http://localhost:3000
   - Test all changes thoroughly
2. **Push to GitHub** (after local testing passes):

   - Run `/dac` to draft a commit message for approval
   - **NEVER commit directly** - always wait for user approval
   - Push changes to your feature branch after approval
3. **Create PR to main** (with documentation):

   - Include screenshots of the feature
   - Add changelog entry (see [Feature Documentation](#feature-documentation))
   - Merge to main after review
4. **Production Deployment** (main → production):

   - Batch tested features on main
   - Final screenshot verification
   - Merge main → production
   - Vercel auto-deploys from production branch
   - Site runs at https://needthisdone.com

**Architecture:**
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (Medusa)
- **Database**: Supabase
- **Cache**: Upstash Redis

---

## Autonomous Work Mode

**When on an experiment branch**, work continuously without stopping:

1. **Don't stop for approvals** - Keep working through TODO.md items
2. **Implement → Test → Fix → Document** - Complete the full cycle
3. **Update TODO.md** as tasks complete
4. **Run tests after each change** - Fix any failures immediately
5. **Document completed features** in README.md
6. **Use agent swarms** - Launch parallel agents for thorough exploration and implementation

**Agent Swarm Strategy:**

- **Exploration:** Launch 2-3 Explore agents in parallel to search different areas of the codebase
- **Implementation:** Break large features into parallel workstreams when files don't depend on each other
- **Documentation:** Launch agents to document different sections simultaneously
- **Testing:** Run test suites in parallel where possible

**Safety:** Commits and destructive git operations are blocked by settings.json (see [Git & Bash Command Restrictions](#git--bash-command-restrictions) for full list). All changes stay local until user reviews.

**When to pause:**

- External service setup needed (Google Cloud Console, API keys)
- Destructive operations that can't be undone
- Ambiguous requirements with multiple valid approaches

---

## Git & Bash Command Restrictions

To keep things safe during autonomous work, certain git and bash commands are blocked by settings.json:

### ✅ Safe Commands (Always Allowed)

**Git read-only:** `git status`, `git log`, `git diff`, `git branch`
**Development:** `npm run dev`, `npm test`, `npm run build`, `npm run lint`
**File operations:** All Read, Edit, Write tool operations

### 🚫 Blocked Commands (Require User Approval)

**Git write:** `git commit`, `git push`, `git merge`, `git rebase`, `git checkout`
**Destructive:** `rm -rf`, `sudo`
**Secrets:** Reading/writing `.env` or `secrets.*` files

### What to Do When Blocked

1. Explain what you need to do and why
2. Ask the user to run it manually
3. Continue with the next step after they confirm

Example: "I need to commit these changes. Please run: `git commit -m 'your message'`"

---

## Branch Workflow

When working on any task that involves creating a new branch:

1. **Create the branch with a descriptive name** following this pattern: `claude/<feature-or-task-description>` (e.g., `claude/add-user-auth`, `claude/fix-nav-styling`)

2. **Push the branch to origin immediately after the first meaningful commit** — don't wait until the work is complete. Run `git push -u origin <branch-name>` early so the branch is visible on GitHub.

3. **Notify the user when you've pushed** by stating the branch name and a one-line summary of what you're working on.

4. **Continue pushing commits as you progress** so changes can be tracked in real-time from a local IDE.

**Why This Matters:**

Multiple Claude Code sessions may run concurrently on different tasks. Pushing branches early enables:
- Monitoring all in-flight work locally
- Spotting potential conflicts before they compound
- Controlling integration sequence when merging into main

```
┌─────────────────────────────────────────────────────────────┐
│                    BRANCH WORKFLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CREATE BRANCH                                           │
│     └── Pattern: claude/<feature-description>               │
│                                                             │
│  2. FIRST MEANINGFUL COMMIT                                 │
│     └── git push -u origin <branch-name>  ← Push early!     │
│                                                             │
│  3. NOTIFY                                                  │
│     └── State branch name + one-line summary                │
│                                                             │
│  4. CONTINUE PUSHING                                        │
│     └── Regular commits for real-time tracking              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Local IDE: Testing Claude Branches

**Separation of concerns:** Claude Code sessions create features; you test and merge locally.

```
┌─────────────────────────────────────────────────────────────┐
│              SEPARATION OF CONCERNS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CLAUDE CODE SESSIONS          YOUR LOCAL IDE               │
│  ─────────────────────         ──────────────────           │
│  • Create new features         • git fetch --all            │
│  • Push to branches            • git branch -a              │
│  • Iterate on code             • Checkout & test            │
│  • Keep pushing commits        • Run locally                │
│                                • Review changes             │
│         ↓                      • Create PR when ready       │
│    Feature branches     →      • Merge after testing ✓      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Commands for your local IDE:**

```bash
# Fetch all remote branches (updates your local view)
git fetch --all

# See ALL branches (local + remote)
git branch -a

# See only remote branches (what Claude has pushed)
git branch -r

# Switch to a Claude branch to test it
git checkout claude/feature-name

# Run the app locally to test
cd app && npm run dev
```

**The rule:** Nothing hits `main` until verified locally. Nothing hits `production` until documented with screenshots. Claude builds, you validate and merge.

---

## Hooks

Five hooks in `.claude/hooks/` support your workflow:

| Hook | When | Purpose |
|------|------|---------|
| `session-start.sh` | Session starts/resumes | Shows TODO.md priorities |
| `post-tool-use.sh` | After Edit/Write on .ts/.tsx | Auto-runs ESLint --fix |
| `todo-sync.sh` | After TodoWrite | Reminds to update TODO.md |
| `stop-check.sh` | Before stopping | Blocks if >7 completed items |
| `user-prompt-submit.sh` | User submits prompt | Reminds to run tests |

**TODO.md is the source of truth.** Check it before starting work, update it when completing tasks.

---

## Task Tracking

**TODO.md** → Incomplete, untested features
**README.md** → Production-ready, battle-tested features

**Flow:** TODO.md (incomplete) → test & verify → README.md (production-ready)

---

## Terminal Preferences

**Chain commands with `&&`** - When giving terminal commands to run, combine sequential operations into a single line:
```bash
# Good
git checkout main && git merge dev && git push origin main

# Avoid
git checkout main
git merge dev
git push origin main
```

---

## No Broken Windows Policy

**Fix warnings and errors immediately—don't ignore them.**

- Build warnings → fix before shipping
- Test failures → fix, don't skip
- TypeScript errors → resolve, don't `@ts-ignore`
- Linting failures → address, don't disable
- Half-done features → complete or remove

**Zero warnings in production code. Always.**

---

## Color System Reminder

**NEVER hardcode colors.** All colors come from [lib/colors.ts](app/lib/colors.ts).

```typescript
import { formInputColors, accentColors } from '@/lib/colors';

<p className={formInputColors.helper}>Helper text</p>
```

For Puck components, use `getPuckAccentColors()` and `getPuckFullColors()` from `lib/puck-utils.tsx`.

---

## Quick Reference

| Need | Go to |
|------|-------|
| Branch Strategy | See [Branch Architecture](#branch-architecture) |
| Feature Docs | See [Feature Documentation](#feature-documentation) |
| Commands | See [README.md → Quick Start](README.md#quick-start) |
| Architecture | See [README.md → Architecture Overview](README.md#architecture-overview) |
| Testing | See [README.md → Testing](README.md#testing) |
| Puck Components | See [README.md → Puck Visual Builder](README.md#puck-visual-builder) |
| Template System | See [README.md → Template System](README.md#template-system) |
| API Patterns | See [README.md → API Patterns](README.md#api-patterns) |
| Design System | See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) |
| Brand Identity | See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) |
| Coding Standards | See [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) |

---

*Last Updated: December 27, 2025*

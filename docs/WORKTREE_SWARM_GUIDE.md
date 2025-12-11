# Worktree Swarm Guide

Run parallel Claude Code agents across git worktrees for faster feature development.

---

## Quick Start

Get two agents working in parallel in under 60 seconds:

```bash
# 1. Create the worktree directory
mkdir -p ~/.claude-worktrees/my-project

# 2. Spawn two worktrees from your current branch
cd /path/to/your/repo
git worktree add ~/.claude-worktrees/my-project/feature-api-agent1 -b feature-api-agent1
git worktree add ~/.claude-worktrees/my-project/feature-ui-agent2 -b feature-ui-agent2

# 3. Open terminals and start Claude Code in each
cd ~/.claude-worktrees/my-project/feature-api-agent1 && claude
cd ~/.claude-worktrees/my-project/feature-ui-agent2 && claude

# 4. Give each agent their scope and let them work
```

That's it. Two agents, two branches, one repo. Keep reading for the strategy that makes this actually work.

---

## The Big Picture

### Why This Approach Works

Think of it like running a small development team—except each team member is a Claude Code session with laser focus on one piece of the puzzle. Instead of context-switching between API work and UI work, you have:

- **Agent 1**: Heads-down on backend endpoints
- **Agent 2**: Focused entirely on frontend components
- **Agent 3**: Writing tests without stepping on anyone's toes

Each agent has its own working directory (worktree), its own branch, and—critically—its own clear boundaries. You're the conductor, orchestrating the merge.

### When to Use This

**This approach shines when:**
- A feature has clearly separable parts (backend, frontend, tests)
- You're blocked waiting for one piece before starting another
- The parts can be developed independently then integrated
- You want faster turnaround on medium-to-large features

**Skip this when:**
- The task is small enough for one focused session
- Everything needs to touch the same files
- You're doing exploratory work where scope isn't clear yet
- The overhead of coordination outweighs the parallelism benefit

---

## Git Worktree Primer

If you haven't used git worktrees before, here's the quick version:

### What Worktrees Are

A worktree is an additional working directory linked to your same repository. Unlike cloning (which creates a separate repo), worktrees share:
- The same `.git` directory
- The same branches, commits, and history
- The same remotes

But each worktree can have:
- A different branch checked out
- Different uncommitted changes
- Its own `node_modules` (if needed)

### Basic Commands

```bash
# Create a new worktree with a new branch
git worktree add <path> -b <branch-name>

# Create a worktree for an existing branch
git worktree add <path> <existing-branch>

# List all worktrees
git worktree list

# Remove a worktree (after merging)
git worktree remove <path>

# Or force remove if branch wasn't merged
git worktree remove <path> --force
```

### Why Worktrees Beat Cloning

| Aspect | Worktrees | Cloning |
|--------|-----------|---------|
| Disk space | Minimal (shared .git) | Full copy each time |
| Branch syncing | Automatic | Manual fetch/pull |
| Merging | Direct (same repo) | Push/pull dance |
| Setup time | Seconds | Minutes |

---

## Setup Structure

### Directory Organization

Keep all your worktrees organized under a central location:

```
~/.claude-worktrees/
├── my-project/
│   ├── feature-auth-agent1/        # Agent 1's workspace
│   ├── feature-auth-agent2/        # Agent 2's workspace
│   └── feature-auth-tests-agent3/  # Agent 3's workspace
├── another-project/
│   └── ...
```

### Naming Convention

Use this pattern: `<feature>-<scope>-agent<N>`

Examples:
- `profile-backend-agent1` — API and database work
- `profile-frontend-agent2` — UI components
- `profile-tests-agent3` — Test coverage
- `checkout-payments-agent1` — Payment integration
- `checkout-ui-agent2` — Checkout flow UI

The naming makes it obvious what each agent owns at a glance.

### Shell Script: spawn-worktree.sh

Save this to your project root or `~/.local/bin/`:

```bash
#!/bin/bash
# spawn-worktree.sh - Quickly create a worktree for a Claude Code agent

set -e

# Configuration
WORKTREE_BASE="$HOME/.claude-worktrees"
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel)")
BASE_BRANCH="${2:-$(git branch --show-current)}"

# Usage check
if [ -z "$1" ]; then
    echo "Usage: spawn-worktree.sh <worktree-name> [base-branch]"
    echo "Example: spawn-worktree.sh profile-backend-agent1 dev"
    exit 1
fi

WORKTREE_NAME="$1"
WORKTREE_PATH="$WORKTREE_BASE/$PROJECT_NAME/$WORKTREE_NAME"

# Create directory structure
mkdir -p "$WORKTREE_BASE/$PROJECT_NAME"

# Create the worktree
echo "Creating worktree: $WORKTREE_PATH"
echo "Base branch: $BASE_BRANCH"
git worktree add "$WORKTREE_PATH" -b "$WORKTREE_NAME" "$BASE_BRANCH"

# Install dependencies (optional - uncomment if needed)
# echo "Installing dependencies..."
# cd "$WORKTREE_PATH" && npm install

echo ""
echo "Worktree created! To start working:"
echo "  cd $WORKTREE_PATH && claude"
echo ""
echo "Don't forget to create a CLAUDE.md with agent scope!"
```

Make it executable:
```bash
chmod +x spawn-worktree.sh
```

### Handling node_modules

You have two options:

**Option A: Per-worktree node_modules (recommended)**
Each worktree gets its own `node_modules`. Takes more disk space but avoids weird issues.

```bash
cd ~/.claude-worktrees/my-project/feature-api-agent1
npm install
```

**Option B: Shared node_modules via symlink**
If you're tight on disk space and packages are identical:

```bash
# In each worktree
ln -s /path/to/main/repo/node_modules ./node_modules
```

Caveat: This breaks if any agent needs to add packages. Stick with Option A unless you have a good reason.

---

## Task Decomposition Strategy

This is where the magic happens—or where things fall apart. Choose wisely.

### What CAN Be Parallelized

| Task Type | Why It Works | Example |
|-----------|--------------|---------|
| **Independent modules** | No shared state | Auth system vs. payment system |
| **Separate file domains** | Clear boundaries | `app/api/*` vs. `app/components/*` |
| **Different layers** | Natural separation | Database schema vs. UI components |
| **New isolated features** | Greenfield code | New page + new API endpoint |
| **Tests written after implementation** | Tests follow code | Agent 1 builds, Agent 2 tests |

### What SHOULD NOT Be Parallelized

| Task Type | Why It Breaks | What Happens |
|-----------|---------------|--------------|
| **Same-file edits** | Merge conflicts guaranteed | Both agents edit `utils.ts` |
| **Shared state dependencies** | Race condition in logic | Both need auth context changes |
| **Tightly coupled code** | Changes cascade | Edit type → breaks 5 consumers |
| **Schema + queries together** | Chicken-and-egg | Can't write queries until schema exists |
| **Shared config files** | Silent conflicts | Both touch `tailwind.config.js` |

### Good vs. Bad Task Splits

**Good Split: User Profile Feature**
```
Agent 1: Database + API
├── prisma/schema.prisma (add User model)
├── app/api/profile/route.ts
└── app/api/profile/[id]/route.ts

Agent 2: Frontend
├── app/components/profile/ProfileCard.tsx
├── app/components/profile/ProfileForm.tsx
└── app/(routes)/profile/page.tsx

Agent 3: Tests
├── app/e2e/profile.spec.ts
└── __tests__/api/profile.test.ts
```

**Bad Split: The Same Feature Done Wrong**
```
Agent 1: "Backend stuff"
├── prisma/schema.prisma
├── app/api/profile/route.ts
└── lib/utils.ts  ← DANGER: shared utility file

Agent 2: "Frontend stuff"
├── app/components/profile/ProfileCard.tsx
└── lib/utils.ts  ← CONFLICT: both agents touch this

Agent 3: "Everything else"
├── app/api/profile/route.ts  ← CONFLICT: overlaps Agent 1
└── ...
```

### The Golden Rule

If two agents might reasonably edit the same file, restructure the split or serialize those tasks.

---

## Agent Orchestration

### Per-Worktree CLAUDE.md Template

Create this file in each worktree before starting the agent:

```markdown
# Agent Scope: [Feature Name] - [Specific Focus]

This agent is part of a parallel development swarm. Stay within your boundaries.

## Your Boundaries

### Files You OWN (create and edit freely)
- `app/api/profile/**/*`
- `prisma/migrations/**/migration.sql` (for your changes only)
- `lib/profile-utils.ts` (if you need shared utilities, create them here)

### Files You May READ (for context, don't edit)
- `lib/types.ts` — Use existing types
- `app/components/**/*` — Understand the UI patterns
- `prisma/schema.prisma` — See the current schema

### Files You Must NOT Touch
- `lib/utils.ts` — Another agent owns shared utilities
- `app/components/**/*` — Frontend agent's domain
- `tailwind.config.js` — Config changes need coordination
- `package.json` — Package changes need conductor approval

## Your Mission

Build the profile API endpoints with these requirements:
1. GET /api/profile - List profiles with pagination
2. GET /api/profile/[id] - Get single profile
3. POST /api/profile - Create profile
4. PUT /api/profile/[id] - Update profile
5. DELETE /api/profile/[id] - Delete profile

Use the existing auth patterns from `app/api/auth/*` as reference.

## Communication Artifacts

Before marking your work complete, create these files in your worktree root:

### CHANGES.md
What you changed and why:
- List every file you created or modified
- Explain key decisions
- Note any deviations from the original plan

### DECISIONS.md
Technical trade-offs you made:
- Why you chose approach A over B
- Any patterns you established that other agents should follow
- Assumptions you made

### BLOCKERS.md (if applicable)
Issues you couldn't resolve:
- What's blocking
- What you tried
- Suggested resolution

## Integration Notes

Your work will be merged in this order:
1. Database/schema changes (you might be first or second)
2. This API work
3. Frontend that consumes these APIs
4. Tests

The conductor will handle the merge. Your job is clean, working code.
```

### "Stay in Your Lane" Directives

The key phrases to include in every agent's CLAUDE.md:

1. **Explicit ownership**: "Files you OWN" gives permission
2. **Read-only context**: "Files you may READ" provides information without edit rights
3. **Hard boundaries**: "Files you must NOT touch" prevents conflicts
4. **Clear deliverables**: Numbered list of what "done" looks like
5. **Artifact requirements**: Non-negotiable documentation

### Communication Through Artifacts

Since agents can't talk to each other, they communicate through files:

| Artifact | Purpose | When to Write |
|----------|---------|---------------|
| `CHANGES.md` | What changed | Always, before finishing |
| `DECISIONS.md` | Why it changed that way | When you made trade-offs |
| `BLOCKERS.md` | What stopped progress | When stuck or uncertain |

These become your merge notes. The conductor reads them all before integrating.

---

## Docker Environment Sharing

Since this project uses Docker for development, here's how to handle it across worktrees.

### The Challenge

Each worktree is a separate directory, but they might all need:
- The same database
- The same Redis instance
- The same backend services

Running `docker-compose up` in each worktree would create conflicts.

### Recommended Approach: Shared Docker, Code-Only Changes

**Keep one Docker environment running in your main repo:**

```bash
# In your main repo (not a worktree)
cd /path/to/main/repo
docker-compose up -d
```

**Agents make code changes only:**
- Each worktree edits code
- All worktrees share the running Docker services
- The app in each worktree connects to the same database at `localhost:5432`

This works because:
- Code changes don't need isolated databases (usually)
- Hot-reload works in each worktree independently
- No port conflicts

### When to Use Separate Docker Instances

Sometimes you need isolation:

| Scenario | Solution |
|----------|----------|
| Testing database migrations | Spin up a separate Postgres container on a different port |
| Breaking schema changes | Use a test database, not shared dev database |
| Different env configurations | Create a `docker-compose.agent.yml` override file |

**Example: Isolated database for migration testing**

```bash
# In the worktree that needs isolation
docker run -d \
  --name postgres-agent1 \
  -e POSTGRES_PASSWORD=test \
  -p 5433:5432 \
  postgres:15

# Update .env.local in that worktree
DATABASE_URL="postgresql://postgres:test@localhost:5433/mydb"
```

### Port Conflict Avoidance

If you must run separate Docker stacks:

| Worktree | App Port | DB Port | Redis Port |
|----------|----------|---------|------------|
| Main repo | 3000 | 5432 | 6379 |
| agent1 | 3001 | 5433 | 6380 |
| agent2 | 3002 | 5434 | 6381 |

Update each worktree's `.env.local` accordingly.

---

## Merge Strategy

This is where conductor skills matter most.

### Recommended Merge Order

Always merge in dependency order—foundation before features:

```
1. Infrastructure/Config Changes
   └── Docker, env vars, build config

2. Database/Schema Changes
   └── Migrations, Prisma schema

3. Shared Types and Utilities
   └── lib/types.ts, shared functions

4. Backend/API Changes
   └── API routes, server actions

5. Frontend Components
   └── UI that consumes the APIs

6. Pages/Routes
   └── Full pages that compose components

7. Tests
   └── E2E and unit tests (validates everything)
```

### Conductor Session Workflow

As the conductor (you), here's your merge playbook:

```bash
# 1. Go to your main worktree
cd /path/to/main/repo

# 2. Create an integration branch
git checkout -b feature/profile-integration

# 3. Collect all agent artifacts
for agent in agent1 agent2 agent3; do
  cp ~/.claude-worktrees/my-project/profile-*-$agent/CHANGES.md \
     ./merge-notes/$agent-changes.md
done

# 4. Review the CHANGES.md from each agent
# Understand what each one did before merging

# 5. Merge in order (database first)
git merge profile-db-agent1 --no-ff -m "Merge: Profile database schema and API"

# 6. Run tests, fix any issues
npm run test
npm run type-check

# 7. Merge frontend
git merge profile-ui-agent2 --no-ff -m "Merge: Profile UI components"

# 8. Test again
npm run test

# 9. Merge tests last
git merge profile-tests-agent3 --no-ff -m "Merge: Profile test coverage"

# 10. Full test suite
npm run test
npm run e2e
```

### Conflict Resolution Patterns

**Import statement conflicts:**
```typescript
// Agent 1's version
import { Profile } from '@/lib/types';

// Agent 2's version
import { User } from '@/lib/types';

// Resolved: Alphabetize and merge
import { Profile, User } from '@/lib/types';
```

**Type definition conflicts:**
```typescript
// Agent 1 added to types.ts
export interface Profile {
  id: string;
  userId: string;
}

// Agent 2 added to types.ts
export interface ProfileSettings {
  theme: 'light' | 'dark';
}

// Resolved: Both additions are valid, keep both
export interface Profile {
  id: string;
  userId: string;
}

export interface ProfileSettings {
  theme: 'light' | 'dark';
}
```

**package.json conflicts:**
```bash
# Use npm to resolve lockfile
npm install
# Or if you have conflicts in dependencies:
npx npm-merge-driver install
```

### Integration Testing Checkpoints

Run tests after each merge, not just at the end:

```bash
# After each merge:
npm run type-check    # Types still valid?
npm run lint          # Linting passes?
npm run test          # Unit tests pass?
npm run build         # Build succeeds?

# After final merge:
npm run e2e           # Full E2E suite
```

---

## Example Workflow: 3-Agent Feature Build

Let's walk through adding a user profile system with three parallel agents.

### The Feature

**Requirements:**
- Database: User profiles with preferences
- API: CRUD endpoints for profiles
- UI: Profile page, edit form, settings panel
- Tests: E2E and unit coverage

### Setup Phase

```bash
# Terminal 1: Create worktrees
./spawn-worktree.sh profile-db-agent1 dev
./spawn-worktree.sh profile-ui-agent2 dev
./spawn-worktree.sh profile-tests-agent3 dev
```

### Agent 1: Database/Backend

**Worktree:** `profile-db-agent1`

**CLAUDE.md scope:**
```markdown
## Files You OWN
- prisma/schema.prisma (Profile model addition)
- prisma/migrations/**/*
- app/api/profile/**/*
- lib/profile.ts (server-side profile utilities)

## Your Mission
1. Add Profile model to Prisma schema
2. Create and run migration
3. Build CRUD API routes
4. Export TypeScript types for the frontend
```

**Deliverables:**
- `prisma/schema.prisma` — Updated with Profile model
- `prisma/migrations/xxx_add_profile/` — Migration files
- `app/api/profile/route.ts` — List + Create
- `app/api/profile/[id]/route.ts` — Get, Update, Delete
- `lib/types/profile.ts` — Shared types

### Agent 2: Frontend/UI

**Worktree:** `profile-ui-agent2`

**CLAUDE.md scope:**
```markdown
## Files You OWN
- app/components/profile/**/*
- app/(routes)/profile/**/*
- lib/hooks/useProfile.ts

## Files You May READ
- lib/types/profile.ts (types from Agent 1 - copy locally if needed)
- app/api/profile/**/* (understand the API shape)

## Your Mission
1. Build ProfileCard component
2. Build ProfileForm component (create/edit)
3. Build profile page with layout
4. Add client-side hooks for data fetching
```

**Deliverables:**
- `app/components/profile/ProfileCard.tsx`
- `app/components/profile/ProfileForm.tsx`
- `app/components/profile/ProfileSettings.tsx`
- `app/(routes)/profile/page.tsx`
- `app/(routes)/profile/edit/page.tsx`
- `lib/hooks/useProfile.ts`

### Agent 3: Tests

**Worktree:** `profile-tests-agent3`

**CLAUDE.md scope:**
```markdown
## Files You OWN
- app/e2e/profile.spec.ts
- __tests__/api/profile.test.ts
- __tests__/components/profile/**/*

## Files You May READ
- Everything (you need full context to write tests)

## Your Mission
1. E2E tests for profile CRUD flow
2. API route unit tests
3. Component unit tests
4. Accessibility tests for profile components
```

**Deliverables:**
- `app/e2e/profile.spec.ts`
- `__tests__/api/profile.test.ts`
- `__tests__/components/profile/ProfileCard.test.tsx`
- `__tests__/components/profile/ProfileForm.test.tsx`

### Orchestration Timeline

```
T+0:00  All 3 agents start working
        ├── Agent 1: Creating Prisma schema
        ├── Agent 2: Building UI components (with mock data)
        └── Agent 3: Writing test skeletons

T+0:30  Agent 1 finishes first (database work is foundational)
        └── Conductor: Merge profile-db-agent1 → integration branch
        └── Conductor: Run type-check, fix any issues

T+0:45  Agent 2 finishes frontend
        └── Conductor: Merge profile-ui-agent2 → integration branch
        └── Conductor: Resolve import conflicts for types
        └── Conductor: Run type-check + build

T+1:00  Agent 3 finishes tests
        └── Conductor: Merge profile-tests-agent3 → integration branch
        └── Conductor: Run full test suite

T+1:15  Conductor: Final review
        └── All tests passing
        └── Type-check clean
        └── Build succeeds
        └── Merge integration → dev
```

### Post-Merge Checklist

```bash
# After all merges complete:
npm run type-check     # ✓ No type errors
npm run lint           # ✓ Linting passes
npm run build          # ✓ Build succeeds
npm run test           # ✓ Unit tests pass
npm run e2e            # ✓ E2E tests pass

# Cleanup
git worktree remove ~/.claude-worktrees/my-project/profile-db-agent1
git worktree remove ~/.claude-worktrees/my-project/profile-ui-agent2
git worktree remove ~/.claude-worktrees/my-project/profile-tests-agent3
```

---

## Troubleshooting

### Agents Stepping on Each Other's Files

**Symptom:** Merge conflicts in files that shouldn't have conflicts.

**Cause:** Boundaries weren't clear enough, or agents "helpfully" refactored shared code.

**Fix:**
1. Be more explicit in CLAUDE.md about file ownership
2. Add specific "DO NOT TOUCH" instructions
3. If it keeps happening, that file needs a dedicated owner or should be off-limits to all agents

### Merge Conflicts in package-lock.json

**Symptom:** Massive conflicts in `package-lock.json` after any agent ran `npm install`.

**Fix:**
```bash
# Accept either version, then regenerate
git checkout --theirs package-lock.json
npm install
git add package-lock.json
```

Or use the npm merge driver:
```bash
npx npm-merge-driver install --global
```

### TypeScript Errors After Merge

**Symptom:** Type errors that neither agent had individually.

**Cause:** Agents defined similar types differently, or one agent's types depend on another's work.

**Fix:**
1. Check `DECISIONS.md` for type-related decisions
2. Consolidate duplicate type definitions
3. Run `npm run type-check` after each merge, not just at the end

### Git Worktree Cleanup Issues

**Symptom:** `git worktree remove` fails with "branch is not fully merged."

**Fix:**
```bash
# If you're sure you want to delete (branch was already merged or abandoned)
git worktree remove <path> --force

# Then clean up the branch if needed
git branch -D <branch-name>
```

### Agent Produced Incompatible Code

**Symptom:** Agent 2's UI doesn't match Agent 1's API shape.

**Cause:** Agents worked from different assumptions about the interface.

**Prevention:**
1. Define the interface contract before agents start
2. Put interface definitions in a `CONTRACTS.md` file that all agents read
3. Have one agent produce types first, then share that file

---

## Automation Scripts

### spawn-worktree.sh (Full Version)

```bash
#!/bin/bash
# spawn-worktree.sh - Create a worktree with agent CLAUDE.md template

set -e

WORKTREE_BASE="$HOME/.claude-worktrees"
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel)")
BASE_BRANCH="${2:-$(git branch --show-current)}"
WORKTREE_NAME="$1"

if [ -z "$1" ]; then
    echo "Usage: spawn-worktree.sh <worktree-name> [base-branch]"
    exit 1
fi

WORKTREE_PATH="$WORKTREE_BASE/$PROJECT_NAME/$WORKTREE_NAME"

mkdir -p "$WORKTREE_BASE/$PROJECT_NAME"
git worktree add "$WORKTREE_PATH" -b "$WORKTREE_NAME" "$BASE_BRANCH"

# Create agent CLAUDE.md template
cat > "$WORKTREE_PATH/CLAUDE.md" << 'EOF'
# Agent Scope: [FILL IN FEATURE] - [FILL IN FOCUS]

## Your Boundaries

### Files You OWN
- [List files this agent creates/edits]

### Files You May READ
- [List files for context only]

### Files You Must NOT Touch
- [List off-limits files]

## Your Mission
1. [First deliverable]
2. [Second deliverable]
3. [Third deliverable]

## Communication Artifacts
Create these before finishing:
- CHANGES.md - What you changed and why
- DECISIONS.md - Technical trade-offs
- BLOCKERS.md - Issues (if any)
EOF

echo "Worktree created at: $WORKTREE_PATH"
echo "Edit the CLAUDE.md template, then run: cd $WORKTREE_PATH && claude"
```

### collect-artifacts.sh

```bash
#!/bin/bash
# collect-artifacts.sh - Gather all agent artifacts for review

set -e

WORKTREE_BASE="$HOME/.claude-worktrees"
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel)")
OUTPUT_DIR="./merge-artifacts"

mkdir -p "$OUTPUT_DIR"

for worktree in "$WORKTREE_BASE/$PROJECT_NAME"/*; do
    if [ -d "$worktree" ]; then
        agent_name=$(basename "$worktree")
        echo "Collecting from $agent_name..."

        mkdir -p "$OUTPUT_DIR/$agent_name"

        [ -f "$worktree/CHANGES.md" ] && cp "$worktree/CHANGES.md" "$OUTPUT_DIR/$agent_name/"
        [ -f "$worktree/DECISIONS.md" ] && cp "$worktree/DECISIONS.md" "$OUTPUT_DIR/$agent_name/"
        [ -f "$worktree/BLOCKERS.md" ] && cp "$worktree/BLOCKERS.md" "$OUTPUT_DIR/$agent_name/"
    fi
done

echo ""
echo "Artifacts collected in $OUTPUT_DIR/"
echo "Review these before merging."
```

### cleanup-worktrees.sh

```bash
#!/bin/bash
# cleanup-worktrees.sh - Remove completed worktrees

set -e

WORKTREE_BASE="$HOME/.claude-worktrees"
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel)")

echo "Current worktrees for $PROJECT_NAME:"
git worktree list
echo ""

read -p "Remove all worktrees in $WORKTREE_BASE/$PROJECT_NAME? (y/N) " confirm
if [ "$confirm" != "y" ]; then
    echo "Aborted."
    exit 0
fi

for worktree in "$WORKTREE_BASE/$PROJECT_NAME"/*; do
    if [ -d "$worktree" ]; then
        echo "Removing: $worktree"
        git worktree remove "$worktree" --force 2>/dev/null || true
    fi
done

# Clean up orphaned branches (optional)
read -p "Also delete the agent branches? (y/N) " delete_branches
if [ "$delete_branches" = "y" ]; then
    for branch in $(git branch | grep -E '(agent[0-9]+|integration)'); do
        echo "Deleting branch: $branch"
        git branch -D "$branch" 2>/dev/null || true
    done
fi

echo "Cleanup complete."
```

---

## Key Principles

1. **Explicit > Implicit** — Every agent needs crystal-clear boundaries. Ambiguity causes conflicts.

2. **Artifacts are non-negotiable** — `CHANGES.md` is how agents communicate. No artifact = no merge.

3. **Merge order matters** — Foundation before features. Database before API. API before UI.

4. **Test at each integration point** — Don't batch all merges then pray. Validate incrementally.

5. **The conductor is essential** — You're the human (or single Claude session) that orchestrates. Agents don't self-organize.

---

## Using the Worktree Swarm Skill

Instead of following this guide manually, you can invoke the `worktree-swarm` skill in Claude Code:

```
/skill worktree-swarm
```

The skill will:
1. Analyze your task for parallelization potential
2. Propose an agent split with clear boundaries
3. Create the worktrees and agent CLAUDE.md files
4. Provide launch instructions for each agent
5. Guide you through the merge when agents finish

This is the fastest way to get started if you're already in a Claude Code session.

---

## See Also

- [worktree-swarm skill](../.claude/skills/worktree-swarm.md) — Interactive skill for Claude Code
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deployment workflow
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Design standards for UI work
- [.claude/INSTRUCTIONS.md](../.claude/INSTRUCTIONS.md) — Code organization standards

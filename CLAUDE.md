IMPORTANT: Interact with me and output content that sounds and feels inviting, focused, considerate, supportive, and influential all throughout and use language that's easy to understand. Speak as if speaking to a friend over coffee.

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
   - Push changes to the `dev` branch after approval
3. **Production Deployment** (automatic via Vercel):

   - Push to `main` branch triggers Vercel deployment
   - Site runs at https://needthisdone.com

**Architecture:**
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (Medusa)
- **Database**: Supabase
- **Cache**: Upstash Redis

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

## Git & Bash Command Restrictions

To keep things safe during autonomous work, certain git and bash commands are blocked by settings.json. Here's what you can and can't do:

### ✅ Safe Commands (Always Allowed)

**Git read-only operations:**
- `git status` - Check current state
- `git log` - View commit history
- `git diff` - See changes
- `git branch` - List branches
- `git branch --show-current` - Get current branch name

**Development commands:**
- `npm run dev` - Start dev server
- `npm test` - Run tests
- `npm run build` - Build project
- `cd app && npm run dev` - Navigate and run commands

**File operations:**
- All Read, Edit, Write tool operations
- ESLint via post-tool-use hook

### 🚫 Blocked Commands (Require User Approval)

**Git write operations:**
- `git commit` - Commits need user review
- `git push` - Pushing to remote needs approval
- `git merge` - Merging branches blocked
- `git rebase` - Rebasing blocked
- `git checkout` - Branch switching blocked
- `git reset --hard` - Destructive resets blocked
- `git branch -d/-D` - Branch deletion blocked
- `git add -A` / `git add .` - Bulk staging blocked

**Destructive operations:**
- `rm -rf` - Recursive deletion blocked
- `sudo` - Elevated privileges blocked

**Environment files:**
- Reading/writing .env files blocked (use system environment)
- Reading/writing secrets.* files blocked

### Why These Restrictions Matter

These safeguards let you work fast on experiment branches while preventing:
- Accidental commits without review
- Unintended branch switches during multi-branch work
- Destructive operations that can't be undone
- Exposure of secrets or credentials

All changes stay local until you review and manually approve them.

### What to Do When Blocked

If you need to run a blocked command:
1. Explain what you need to do and why
2. Ask the user to run it manually
3. Continue with the next step after they confirm

Example: "I need to commit these changes. Please run: `git commit -m 'your message'`"

## Hooks

Three lightweight hooks in `.claude/hooks/` support autonomous work:

| Hook | Purpose |
|------|---------|
| `post-tool-use.sh` | Auto-runs ESLint --fix on edited TypeScript files |
| `user-prompt-submit.sh` | Brief reminder to run tests when test keywords detected |
| `stop-check.sh` | Triggers cleanup of TODO.md → README.md when too many completed items accumulate |

All hooks are non-blocking - they help maintain code quality and documentation automatically.

**Intentionally removed:** Pre-commit type-check hook (conflicted with autonomous workflow and `/dac` approval process).

## Task Tracking

**TODO.md** is for **incomplete, untested features**:

- Check it before starting new work
- Update it when completing tasks
- Contains: To Do, In Progress, Recently Completed sections
- Security issues, bugs, and work-in-progress go here
- Once a feature is **production-ready and tested**, move it to README.md

**README.md** is for **production-ready, battle-tested features**:

- Only document features that are complete and working
- Never include failing tests, incomplete implementations, or security warnings
- If something isn't ready for production, it stays in TODO.md

**Flow:** TODO.md (incomplete) → test & verify → README.md (production-ready)

**.claude plans** (in `.claude/plans/`) are for complex implementations:

- Created when planning mode is invoked
- Contains detailed steps and file changes
- Referenced during execution for context

## Project Overview

See [README.md](README.md) for:

- **Directory structure** - Complete breakdown of folders and subfolders
- **Quick start commands** - How to run the app and Storybook
- **Deployment architecture** - Vercel, Railway, Supabase, Upstash
- **Key files** - Where core utilities and clients live

## Coding Standards

Follow [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) for:

- Separation of concerns and code organization
- DRY principle (Don't Repeat Yourself)
- Clear, section-level comments explaining what code does and why
- File organization and naming conventions

Use self-documenting code with section-level comments. Comment major sections and blocks to explain what they do and why, in plain language that educated adults can understand regardless of coding experience.

### No Broken Windows Policy

**Fix warnings and errors immediately—don't ignore them.**

- If a build produces warnings → fix them before shipping
- If a test fails → fix it, don't skip the test
- If TypeScript complains → resolve the type error, don't use `@ts-ignore`
- If linting fails → address the issue, don't disable the rule
- If accessibility tests fail → fix the accessibility issue
- If a feature is half-done → complete it or remove it, don't leave it broken

**Why this matters:** Small broken windows multiply. One ignored warning becomes ten, which becomes a hundred. Broken code accumulates technical debt that slows everything down. Maintaining high standards keeps the codebase healthy and maintainable.

**The rule:** Zero warnings in production code. Always.

## Design System

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for technical standards (accessibility, colors, testing).

See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for brand identity and aesthetic direction.

The frontend-design skill is enabled for aesthetic guidance.

### Color System

**NEVER hardcode colors.** All colors come from [lib/colors.ts](app/lib/colors.ts).

**Import what you need:**

```typescript
import { formInputColors, formValidationColors, titleColors } from '@/lib/colors';
```

**Use in className:**

```typescript
<p className={formInputColors.helper}>Helper text</p>
<p className={`text-sm ${formValidationColors.error}`}>Error message</p>
```

**Available:** formInputColors, formValidationColors, titleColors, stepBadgeColors, successCheckmarkColors, dangerColors, mutedTextColors, headingColors, linkColors, linkHoverColors, accentColors, featureCardColors, navigationColors.

**Why:** WCAG AA compliance, DRY principle, easy design changes.

## Testing

When adding features:

- New static pages → Add E2E tests in `app/e2e/pages.spec.ts`
- Dark mode variants → Add tests in `app/e2e/pages-dark-mode.spec.ts`
- New forms → Add E2E tests for validation and submission
- New navigation → Add tests in `app/e2e/navigation.spec.ts`
- New components → Add accessibility tests
- Protected routes → Add tests in `app/e2e/dashboard.spec.ts`
- CMS/dynamic pages → Create feature-specific test file (e.g., `app/e2e/pages-puck.spec.ts`)
  - Test admin workflows (create, edit, publish, delete)
  - Test public page rendering and cache behavior
  - Test permission enforcement and access control

See [README.md](README.md) for test commands and [docs/e2e-test-report.md](docs/e2e-test-report.md) for coverage details.

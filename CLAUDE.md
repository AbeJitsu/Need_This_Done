# Claude Code Instructions

Speak like a friend over coffee - inviting, focused, considerate, supportive. Easy to understand.

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `cd app && npm run dev` |
| Run all tests | `cd app && npm run test:e2e` |
| Run accessibility tests | `cd app && npm run test:a11y` |
| Start Storybook | `cd app && npm run storybook` |
| Check priorities | Read `TODO.md` |
| Understand codebase | Read `README.md` |
| Draft a commit | Run `/dac` |
| Document changes | Run `/document` |
| Check work status | Run `/check-work` |

## How to Work

1. Check **TODO.md** for priorities
2. Check **README.md** for how things work
3. Run `cd app && npm run dev` to start
4. Run `/dac` to draft commits (never commit directly)

## Autonomous Mode

Claude works through TODO.md tasks until complete. The stop hook blocks until all tasks are done.

**Task markers in TODO.md:**
- `[→]` = in progress (only 1 at a time)
- `[ ]` = ready to work
- `[x]` = completed
- `[!]` = blocked (skipped)

**Workflow:**
1. Mark a task `[→]` to start working
2. Complete the task
3. Mark it `[x]` and run `/dac`
4. Stop hook shows next task
5. Repeat until all done

**Override commands:**
- "stop for now" - Pause autonomous work
- "skip this task" - Mark current as `[!]` blocked
- "take a break" - Clean stop regardless of tasks

## Rules (Auto-Loaded)

All rules in `.claude/rules/` are enforced automatically:

| Rule | Purpose |
|------|---------|
| **etc-easy-to-change.md** | Design for changeability: 1 change = 1 file edit |
| **tdd.md** | Test-Driven Development: write tests first, code second, always |
| **colors.md** | Never hardcode colors, use `lib/colors.ts` |
| **quality.md** | Fix warnings immediately, zero warnings in production |
| **design-system.md** | Accessibility standards, dark mode, component patterns |
| **design-brief.md** | Brand identity, visual style, creative direction |
| **coding-standards.md** | DRY principle, code organization, naming conventions |
| **hooks.md** | Reference for Claude Code hooks configuration |
| **commit-often.md** | Commit early and often, small focused commits |

## Commands

| Command | What It Does |
|---------|--------------|
| `/dac` | Draft a commit message following project conventions |
| `/document` | Screenshot changed pages + generate changelog entry (auto-runs on session end) |
| `/check-work` | Show git status, diffs, and next steps |

**Auto-Documentation**: Frontend changes are tracked automatically. When a session ends, the stop hook runs `npm run screenshot:affected` to capture screenshots and create changelog templates. No manual `/document` needed.

## Skills

Specialized agents available via `.claude/skills/`:

| Skill | When to Use |
|-------|-------------|
| **launch-a-swarm** | Say "launch a swarm" for parallel code review across 5 domains |
| **frontend-design** | Building distinctive UI with high design quality |
| **worktree-swarm** | Parallelizing work across git worktrees |
| **screenshot-workflow** | Capturing baseline screenshots for visual regression |

## Git Safety

**Allowed:** `git add`, `git commit`, `git push`, `git checkout`, `git branch` (commit often!)

**Blocked:** Direct push to main, force push, merge, rebase, hard reset, branch deletion.

For blocked operations, explain what you need and ask the user to run it.

## Branches

Pattern: `claude/<feature-description>`
Push early and often. Nothing hits `main` without review.

## Terminal

Chain commands: `cmd1 && cmd2 && cmd3`

## Communication

Use ASCII charts for complex flows. Keep them simple.

## Environment Tips

- **Frontend app** is in `/app` directory
- **Supabase** migrations in `/supabase/migrations`
- **Medusa backend** in `/medusa` (deployed on Railway)
- **Environment variables** in `.env.local` (see README.md for required vars)

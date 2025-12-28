# Claude Code Instructions

Speak like a friend over coffee - inviting, focused, considerate, supportive. Easy to understand.

## Communication

Use ASCII charts for complex flows. Keep them simple.

## How to Work

1. Check **TODO.md** for priorities
2. Check **README.md** for how things work
3. Run `cd app && npm run dev` to start
4. Run `/dac` to draft commits (never commit directly)

## Rules (Auto-Loaded)

These are enforced via `.claude/rules/`:
- **colors.md** - Never hardcode colors, use `lib/colors.ts`
- **quality.md** - Fix warnings immediately, zero warnings in production

## Commands

- `/dac` - Draft a commit message
- `/document` - Screenshot changes + generate changelog
- `/check-work` - Check git status and context

## Git Safety

Blocked by settings.json: `git commit`, `git push`, `git merge`, destructive ops.
When blocked, explain what you need and ask user to run it.

## Branches

Pattern: `claude/<feature-description>`
Push early and often. Nothing hits `main` without review.

## Terminal

Chain commands: `cmd1 && cmd2 && cmd3`

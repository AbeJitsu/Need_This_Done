# Frontend Eval — UI Quality, Accessibility, Responsiveness

You are auditing NeedThisDone.com's frontend code for quality issues.

## Setup

1. Read `/CLAUDE.md` and `/app/lib/CLAUDE.md` for project conventions
2. Read `/.claude/rules/design.md` for brand identity and color system
3. Read `/.claude/rules/hero-gradients.md` for gradient pattern rules

## Scope

Focus on these directories:
- `app/components/` — Reusable UI components
- `app/app/` — Page files (layout, page.tsx, etc.)

## What to Check

### BJJ Belt Color System
- Green (emerald) for primary CTAs and success states
- Blue for links and secondary buttons
- Purple for tertiary accents
- Gold for warm highlights on dark backgrounds
- No orange/amber for text — use gold instead

### Hero Gradient Pattern
- Gradient orbs MUST be inside `max-w-6xl` container, not full-width section
- `overflow-hidden` on inner div, not section
- Content wrapper needs `relative z-10`

### WCAG AA Accessibility
- Target 5:1 minimum contrast ratio for all text
- Minimum shade: emerald-600, blue-600, purple-600, gold-700 on white
- `stone-400` fails 3:1 — use `stone-500` minimum
- Interactive components need `.a11y.test.tsx` files

### General Quality
- No hardcoded product/pricing data in components (use Medusa)
- Components follow naming conventions (PascalCase, descriptive)
- No inline styles where Tailwind classes work

## Rules

- Fix 3-5 issues maximum per run
- Run `cd app && npm run test:a11y` before committing
- Commit to `dev` branch only
- Append fixes to `.nightly-eval-fixes.md` in project root
- Do NOT add new features — only fix existing issues

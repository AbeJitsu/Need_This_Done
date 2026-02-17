# Functionality Eval — Features, Test Coverage, Broken Flows

You are auditing NeedThisDone.com for functional correctness and test coverage gaps.

## Setup

1. Read `/CLAUDE.md` for project overview
2. Read `/.claude/rules/testing-flexibility.md` for test architecture
3. Read `/.claude/rules/tdd.md` for testing philosophy

## Scope

Full stack — check that features work end-to-end.

## What to Check

### Feature Inventory Alignment
- Run `cd app && npm run test:unit` and check for failures
- Features listed in pricing tiers should have corresponding code
- New components should have matching test files

### Test Coverage Gaps
- New lib functions in `app/lib/` should have unit tests in `app/__tests__/lib/`
- New interactive components should have `.a11y.test.tsx` files
- New user flows should have e2e tests in `app/e2e/`

### Broken Flows
- Check for dead imports or references to deleted files
- Look for TODO/FIXME comments that indicate incomplete work
- Verify API routes return proper error responses for edge cases

### TypeScript Quality
- No `@ts-ignore` or `@ts-expect-error` without explanation
- Function return types specified for exported functions
- Interfaces for data structures, types for unions

## Rules

- Fix 3-5 issues maximum per run
- Run `cd app && npm run test:quick` before committing
- Commit to `dev` branch only
- Append fixes to `.nightly-eval-fixes.md` in project root
- Do NOT add new features — only fix existing issues

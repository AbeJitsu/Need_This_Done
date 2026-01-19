# Test Directory Instructions

## Philosophy

**E2E tests are preferred.** Only add unit tests for complex logic that's hard to verify through the UI.

## Current Structure

```
__tests__/
  lib/
    wcag-contrast.test.ts     # WCAG contrast calculations (18 tests)
    content-path-mapper.test.ts # Click-to-edit path mapping (16 tests)
e2e/                          # 68+ Playwright E2E tests
```

## Before Adding a Unit Test

Ask: **"Can this be tested through E2E?"**

Add unit tests ONLY when:
- Testing pure functions with complex math/logic
- Testing edge cases impossible to trigger in UI
- Testing utilities used across many components

## Running Tests

```bash
npm run test:unit    # Unit tests (this directory)
npm run test:e2e     # E2E tests (e2e/ directory)
npm run test:a11y    # Accessibility tests
```

## File Naming

- `*.test.ts` for pure logic tests
- `*.test.tsx` for component tests (rare - prefer E2E)
- `*.integration.test.ts` for tests needing external services

## Test Config

Unit tests use `vitest.unit.config.ts` which:
- Runs in Node environment (no jsdom)
- Includes `__tests__/lib/**/*.test.ts` and `__tests__/api/**/*.test.ts`
- Excludes `*.integration.test.ts`

# E2E Test Directory Instructions

## Overview

This directory contains Playwright E2E tests that verify real user functionality.

## Running Tests

```bash
npm run test:e2e                    # All E2E tests
npm run test:a11y                   # Accessibility tests only

# Single test file (with dev server already running)
SKIP_WEBSERVER=true npx playwright test e2e/my-test.spec.ts --project=e2e-bypass
```

## Page Discovery

Use dynamic page discovery instead of hardcoded page lists:

```typescript
import { discoverAllPages, discoverPublicPages } from './utils/page-discovery';

const pages = discoverAllPages();      // All static pages
const publicPages = discoverPublicPages(); // Marketing pages only
```

See `.claude/rules/testing-flexibility.md` for details.

## File Naming

- `*.spec.ts` - Standard E2E tests
- `*.a11y.test.ts` - Accessibility-focused tests

## Key Test Files

| File | Purpose |
|------|---------|
| `accessibility.a11y.test.ts` | WCAG compliance checks |
| `page-render-stability.spec.ts` | All pages render without errors |
| `contrast-audit.spec.ts` | Color contrast verification |

## Writing New Tests

1. Focus on user-visible behavior
2. Use page discovery for multi-page tests
3. Add meaningful assertions (not just "page loads")
4. Consider accessibility implications

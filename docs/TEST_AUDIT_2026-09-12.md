# Test Audit — 2026-09-12

## Conclusion

The suite has real value, but the total count is not a website-quality score.
It combines application behavior, security boundaries, database policy checks,
retirement guards, accessibility checks, browser flows, and bridge safety.
Those categories should remain distinct because they catch different failures.

The audit found no safe basis for deleting tests solely because they are small
or because they inspect source files. The source-inspection tests protect
repository-level contracts such as retired routes, public claims, capability
classification, and documentation links. They are not substitutes for browser
tests, but they have an actionable purpose.

## Verified inventory

| Scope | Files | Declared cases | Result |
|---|---:|---:|---|
| Required application unit/API | 75 | 400 | Passed |
| Accessibility | 6 | 60 | Passed |
| Database/RLS | 8 application suites plus SQL security suite | Environment-gated | Runs through `verify:database` |
| Browser/E2E | 9 | 56 | Requires a running app and selected environment |
| Bridge/worker | 3 | 20 | 19 passed; 1 requires macOS `plutil` |
| Whole repository inventory | 103 | 567 | Includes all layers above |

The four skipped cases reported by the former unit command were database/RLS
cases accidentally discovered by the unit glob. The unit command now excludes
`mcp-access-tokens-rls.test.ts`, matching the other database suites, so skipped
database cases are not presented as part of the fast unit result.

## What actually tests the website

The browser suites are the direct website checks. They cover public route
composition, mobile/desktop smoke behavior, authentication and private
workspace navigation, the operator cockpit, prospecting controls, plan review,
and the MCP diagnostic route.

The unit/API and accessibility suites test the code that powers the website,
including validation, authorization, response shapes, approval gates, pricing
and copy contracts, component semantics, and failure handling. Most provider,
database, and authentication dependencies are deliberately controlled or
mocked, so these tests prove application behavior without claiming live
Supabase, Redis, provider, worker, or customer behavior.

The retirement and source-contract suites test the repository boundary rather
than rendering a page. They prevent removed products, unsafe routes, stale
claims, or undocumented capabilities from returning. They should not be
counted as browser coverage, but their failures remain actionable.

## Execution evidence

From the clean feature-branch checkout:

- `npm run test:unit`: 400 passed across 75 files.
- `npm run test:a11y`: 60 passed across 6 files.
- Unit coverage: 64.87% statements, 57.44% branches, 64.50% functions, and
  67.52% lines.
- `npm run lint`: passed.
- `npm run type-check`: passed.
- `npm test` in `bridge/`: 19 passed and 1 failed because Linux does not have
  the macOS `plutil` executable required by the launchd renderer test.

The unit suite previously failed on a clean checkout because
`mcp-http.test.ts` imported the shared Supabase client even though the test
supplied its own authentication function. The test now mocks the authentication
module, keeping the HTTP contract test independent from Supabase configuration.

## Follow-up gaps

- Run the browser suites against the deployed public site and authenticated
  workspace when those environments are intentionally available.
- Run the database/RLS gate against disposable local Supabase; passing unit
  tests does not prove hosted schema parity.
- Run the bridge launchd test on macOS or provide a platform-neutral fixture for
  the renderer's executable discovery.
- Increase direct browser coverage for the highest-value public intake and
  authenticated result flows before treating the website as end-to-end proven.

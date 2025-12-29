# Test-First Bug Fixes

When fixing bugs, always follow this workflow:

## The Process

1. **Write a failing test first**
   - Create a test that captures the expected behavior
   - Run it to confirm it fails (proving the bug exists)
   - This test becomes your safety net

2. **Fix the code**
   - Make the minimum changes needed to fix the bug
   - Don't refactor or add features during bug fixes

3. **Verify the test passes**
   - Run the test again to confirm the fix works
   - The test should now pass

4. **Commit both together**
   - The test and fix go in the same commit
   - This ensures every bug fix has a regression test

## Why This Matters

- **Proves the bug exists**: A failing test documents the exact problem
- **Proves the fix works**: A passing test proves you fixed it
- **Prevents regressions**: The test catches if the bug returns
- **Documents expected behavior**: Tests serve as living documentation

## Example Workflow

```
User: "Links don't work after exiting edit mode"

1. Write test: edit-mode-exit.spec.ts
   - Enter edit mode
   - Exit edit mode
   - Click link
   - Assert navigation works

2. Run test → FAILS (confirms bug)

3. Fix the code (z-index, state handling, etc.)

4. Run test → PASSES (confirms fix)

5. Commit: "Fix: Restore link functionality after exiting edit mode"
```

## Test Location

- E2E tests: `app/e2e/`
- Unit tests: `app/__tests__/`
- Accessibility tests: `app/__tests__/components/*.a11y.test.tsx`

## Commands

```bash
# Run specific test
SKIP_WEBSERVER=true npx playwright test e2e/my-test.spec.ts --project=e2e-bypass

# Run all E2E tests
npm run test:e2e

# Run unit/accessibility tests
npm run test:run
```

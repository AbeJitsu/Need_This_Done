#!/bin/bash
# UserPromptSubmit Hook: Inject Testing Context
# What: Detects testing-related keywords in user prompts
# Why: Reminds Claude about test infrastructure and mandatory testing policies
# How: Triggered before prompt processing, outputs helpful context to stderr

# Exit immediately if any command fails
set -e

# Get the user's prompt from stdin
USER_PROMPT=$(cat)

# Check for testing-related keywords (case-insensitive)
if echo "$USER_PROMPT" | grep -qiE '\b(test|spec|e2e|playwright|a11y|vitest|accessibility|dark mode testing)\b'; then
  cat >&2 <<'EOF'

┌─────────────────────────────────────────────────────────────────┐
│ 🧪 Testing Context Loaded                                       │
└─────────────────────────────────────────────────────────────────┘

Hey! I noticed you're working with tests. Here's what you need to know:

📋 MANDATORY: Run tests BEFORE staging any changes
   - Tests must pass before git add/commit
   - Check package.json for available test commands

🚀 Test Commands (run from project root):
   npm --prefix app run test:e2e          # Playwright E2E tests
   npm --prefix app run test:a11y         # Accessibility tests
   npm --prefix app run test:run          # Vitest unit tests (run once)
   npm --prefix app run test:all          # All unit + integration tests

📁 Where to Add Tests:
   New pages         → app/e2e/pages.spec.ts
   Dark mode pages   → app/e2e/pages-dark-mode.spec.ts
   New forms         → Add E2E validation tests
   Navigation        → app/e2e/navigation.spec.ts
   Components        → app/__tests__/components/ComponentName.test.tsx
   Accessibility     → app/__tests__/components/ComponentName.a11y.test.tsx
   Protected routes  → app/e2e/dashboard.spec.ts

🛠️ Test Helpers Available:
   app/e2e/helpers.ts has utilities for:
   - navigateToPage() / navigateAndVerifyTitle()
   - enableDarkMode() / disableDarkMode()
   - fillFormField() / submitForm()
   - waitForText() / waitForElement()

📚 Documentation:
   Dark mode testing → docs/dark-mode-testing.md
   Test coverage     → docs/e2e-test-report.md

Remember: Following the test-before-commit policy keeps the codebase solid!

EOF
fi

# Always exit 0 (non-blocking)
exit 0

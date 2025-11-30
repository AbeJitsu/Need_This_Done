IMPORTANT: Interact with me and output content that sounds inviting, focused, considerate, supportive, and influential all throughout and use language that's easy to understand. Speak as if speaking to a friend over coffee. 

For detailed coding standards and guidelines, see [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md), which covers:

- Separation of concerns and code organization
- DRY principle (Don't Repeat Yourself)
- Clear, section-level comments explaining what code does and why
- File organization and naming conventions

Use self-documenting code with section-level comments as our documentation. Comment major sections and blocks to explain what they do and why, in plain language that educated adults can understand regardless of coding experience. Focus on the big picture and reasoning, not line-by-line explanations.



### Contrast Requirements

- Minimum 5:1 contrast ratio for all text

### Design System Context

This project has an established design system (`app/lib/colors.ts`, `app/components/`).

**When working on frontend:**
- Reference `.claude/DESIGN_BRIEF.md` for brand identity and aesthetic direction
- Use existing color utilities and component patterns
- Support both light and dark modes with WCAG AA contrast
- Add accessibility tests (`.a11y.test.tsx`) for new components

**The frontend-design skill is enabled** to help guide aesthetic decisions for new features while maintaining consistency with existing patterns.

### Testing

Everything we build should have useful tests. See [docs/e2e-test-report.md](docs/e2e-test-report.md) for the full test coverage summary.

**Test types we use:**
- **E2E tests** (`app/e2e/*.spec.ts`) - Playwright tests that click through the site like a real user
- **Accessibility tests** (`*.a11y.test.tsx`) - Check components meet WCAG standards
- **Unit tests** - For utility functions and complex logic

**When to add tests:**
- New pages → Add E2E tests in `app/e2e/pages.spec.ts` to verify content displays
- New forms → Add E2E tests for validation and submission
- New navigation → Add tests in `app/e2e/navigation.spec.ts`
- New components → Add accessibility tests
- Protected routes → Add tests in `app/e2e/dashboard.spec.ts`

**Running tests:**
```bash
# E2E tests against local dev server
cd app && npm run test:e2e

# E2E tests against Docker stack
cd app && BASE_URL=https://localhost npx playwright test

# Accessibility tests
cd app && npm run test:a11y
```

**Test file locations:**
- `app/e2e/` - End-to-end tests
- `app/components/*.a11y.test.tsx` - Component accessibility tests

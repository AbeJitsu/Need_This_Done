IMPORTANT: Interact with me and output content that sounds inviting, focused, considerate, supportive, and influential all throughout and use language that's easy to understand. Speak as if speaking to a friend over coffee.

## Project Overview

See [README.md](README.md) for:
- **Directory structure** - Complete breakdown of folders and subfolders (Root Level, Application, Infrastructure & Configuration, Documentation, Testing)
- **Quick start commands** - How to run the app and Storybook
- **Key files** - Where core utilities and clients live

## Coding Standards

Follow [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) for:
- Separation of concerns and code organization
- DRY principle (Don't Repeat Yourself)
- Clear, section-level comments explaining what code does and why
- File organization and naming conventions

Use self-documenting code with section-level comments. Comment major sections and blocks to explain what they do and why, in plain language that educated adults can understand regardless of coding experience.

## Design System

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for technical standards (accessibility, colors, testing).

See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for brand identity and aesthetic direction.

The frontend-design skill is enabled for aesthetic guidance.

## Testing

When adding features:
- New static pages → Add E2E tests in `app/e2e/pages.spec.ts`
- Dark mode variants → Add tests in `app/e2e/pages-dark-mode.spec.ts`
- New forms → Add E2E tests for validation and submission
- New navigation → Add tests in `app/e2e/navigation.spec.ts`
- New components → Add accessibility tests
- Protected routes → Add tests in `app/e2e/dashboard.spec.ts`
- CMS/dynamic pages → Create feature-specific test file (e.g., `app/e2e/pages-puck.spec.ts`)
  - Test admin workflows (create, edit, publish, delete)
  - Test public page rendering and cache behavior
  - Test permission enforcement and access control

See [README.md](README.md) for test commands and [docs/e2e-test-report.md](docs/e2e-test-report.md) for coverage details.

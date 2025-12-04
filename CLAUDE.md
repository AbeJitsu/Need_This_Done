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

Reference [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for brand identity and aesthetic direction.

When working on frontend:
- Use existing color utilities from `app/lib/colors.ts`
- Support both light and dark modes
- Meet WCAG AA contrast (5:1 minimum)
- Add accessibility tests (`.a11y.test.tsx`) for new components

The frontend-design skill is enabled for aesthetic guidance.

## Testing

When adding features:
- New pages → Add E2E tests in `app/e2e/pages.spec.ts`
- New forms → Add E2E tests for validation and submission
- New navigation → Add tests in `app/e2e/navigation.spec.ts`
- New components → Add accessibility tests
- Protected routes → Add tests in `app/e2e/dashboard.spec.ts`

See [README.md](README.md) for test commands.

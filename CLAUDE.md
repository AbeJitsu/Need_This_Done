IMPORTANT: Interact with me and output content that sounds inviting, focused, considerate, supportive, and influential all throughout and use language that's easy to understand. Speak as if speaking to a friend over coffee.

## Development & Deployment Workflow

**Always follow this workflow:**

0. **Check TODO.md** for current priorities and what needs doing

1. **Local Development** (test changes first):
   - Use `npm run dev:start` to start dev environment
   - Access at https://localhost (self-signed SSL certs)
   - Test all changes thoroughly

2. **Push to GitHub** (after local testing passes):
   - Run `/dac` to draft a commit message for approval
   - **NEVER commit directly** - always wait for user approval
   - Push changes to the `dev` branch after approval

3. **Production Deployment** (deploy to DigitalOcean):
   - SSH to DigitalOcean server
   - Pull latest from GitHub
   - Use `npm run prod:build` then `npm run prod:start`
   - Site runs at https://needthisdone.com (Let's Encrypt SSL)

**NEVER run production builds locally** - always test with dev environment first.

## Task Tracking

**TODO.md** is the central task tracker:
- Check it before starting new work
- Update it when completing tasks
- Items flow: To Do → In Progress → Recently Completed → documented in README.md

**.claude plans** (in `.claude/plans/`) are for complex implementations:
- Created when planning mode is invoked
- Contains detailed steps and file changes
- Referenced during execution for context

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

### No Broken Windows Policy

**Fix warnings and errors immediately—don't ignore them.**

- If a build produces warnings → fix them before shipping
- If a test fails → fix it, don't skip the test
- If TypeScript complains → resolve the type error, don't use `@ts-ignore`
- If linting fails → address the issue, don't disable the rule
- If accessibility tests fail → fix the accessibility issue
- If a feature is half-done → complete it or remove it, don't leave it broken

**Why this matters:** Small broken windows multiply. One ignored warning becomes ten, which becomes a hundred. Broken code accumulates technical debt that slows everything down. Maintaining high standards keeps the codebase healthy and maintainable.

**The rule:** Zero warnings in production code. Always.

## Design System

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for technical standards (accessibility, colors, testing).

See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for brand identity and aesthetic direction.

The frontend-design skill is enabled for aesthetic guidance.

### Color System

**NEVER hardcode colors.** All colors come from [lib/colors.ts](app/lib/colors.ts).

**Import what you need:**
```typescript
import { formInputColors, formValidationColors, titleColors } from '@/lib/colors';
```

**Use in className:**
```typescript
<p className={formInputColors.helper}>Helper text</p>
<p className={`text-sm ${formValidationColors.error}`}>Error message</p>
```

**Available:** formInputColors, formValidationColors, titleColors, stepBadgeColors, successCheckmarkColors, dangerColors, mutedTextColors, headingColors, linkColors, linkHoverColors, accentColors, featureCardColors, navigationColors.

**Why:** WCAG AA compliance, DRY principle, easy design changes.

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

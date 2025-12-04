# NeedThisDone.com

A professional services platform built with Next.js, running in Docker with nginx, Redis, and Supabase.

## Quick Start

```bash
# Development (with hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# If things break (missing modules, weird errors)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Once running:
- **App**: https://localhost
- **Storybook**: http://localhost:6006

---

## Project Structure

### Documentation

| File | What it covers |
|------|----------------|
| [DOCKER.md](DOCKER.md) | How to run the app, architecture, troubleshooting |
| [Roadmap.md](Roadmap.md) | Tech stack, what's built, what's pending |
| [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) | Coding standards (DRY, comments, organization) |
| [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) | Brand identity, colors, design system |

### Code

| Folder | Purpose |
|--------|---------|
| `app/app/` | Next.js pages and API routes |
| `app/components/` | Reusable UI components (with Storybook stories) |
| `app/lib/` | Shared utilities (colors, auth, database clients) |
| `app/context/` | React context providers |
| `nginx/` | Reverse proxy and SSL config |
| `supabase/` | Database migrations |

### Testing

| Location | What it tests |
|----------|---------------|
| `app/e2e/` | End-to-end user flows (Playwright) |
| `app/__tests__/` | Unit tests and accessibility tests |

```bash
# Run E2E tests
cd app && npm run test:e2e

# Run accessibility tests
cd app && npm run test:a11y

# Run against Docker stack
cd app && BASE_URL=https://localhost npx playwright test
```

See [docs/e2e-test-report.md](docs/e2e-test-report.md) for current test coverage.

---

## Key Files

| File | What it does |
|------|--------------|
| `app/lib/colors.ts` | Single source of truth for all colors |
| `app/lib/auth.ts` | Authentication utilities |
| `app/lib/supabase.ts` | Database client |
| `app/lib/redis.ts` | Cache client |

---

## Design Principles

- WCAG AA accessibility (5:1 contrast minimum)
- Light and dark mode support
- DRY architecture with reusable components
- Self-documenting code with section-level comments

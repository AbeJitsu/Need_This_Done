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
| [docs/dark-mode-testing.md](docs/dark-mode-testing.md) | Dark mode testing guidelines and WCAG compliance |
| [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) | Coding standards (DRY, comments, organization) |
| [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) | Brand identity, colors, design system |

### Directory Structure

#### Root Level

| File/Folder | Purpose |
|-------------|---------|
| `CLAUDE.md` | Project-specific instructions for Claude Code |
| `README.md` | Main project documentation (you are here) |
| `DOCKER.md` | Docker setup, architecture, troubleshooting |
| `Roadmap.md` | Tech stack and feature planning |
| `docker-compose*.yml` | Docker configurations (dev, prod, test, e2e) |

#### Application (`app/`)

| Folder | Purpose |
|--------|---------|
| `app/app/` | Next.js App Router - pages and API routes |
| `├── admin/` | Admin dashboard routes |
| `├── api/` | API route handlers (auth, demo, projects, files, health) |
| `├── auth/` | Authentication pages |
| `├── demos/` | Demo pages (auth, database, speed) |
| `app/components/` | Reusable React UI components (with Storybook stories) |
| `app/lib/` | Shared utilities (colors, auth, database clients) |
| `app/context/` | React Context providers (AuthContext) |
| `app/config/` | App-wide configuration |

#### Infrastructure & Configuration

| Folder | Purpose |
|--------|---------|
| `.claude/` | Claude Code configuration |
| `├── commands/` | Custom slash commands |
| `├── hooks/` | Git hooks for workflow automation |
| `├── skills/` | Custom Claude skills (frontend-design) |
| `.github/workflows/` | CI/CD workflows (accessibility testing) |
| `nginx/` | Reverse proxy and SSL configuration |
| `├── ssl/` | SSL certificates |
| `supabase/` | Database backend configuration |
| `├── migrations/` | Database schema migrations |
| `scripts/` | Deployment and setup automation |

#### Documentation

| Folder/File | Purpose |
|-------------|---------|
| `docs/` | Developer technical guides |
| `├── dark-mode-testing.md` | Dark mode testing guidelines and best practices |
| `├── e2e-test-report.md` | E2E test coverage report |
| `├── dev-preview-urls.md` | Preview environment configuration |
| `├── url-configuration.md` | URL and redirect configuration |

#### Testing & Quality

| Folder | Purpose |
|--------|---------|
| `app/e2e/` | End-to-end tests (Playwright) |
| `app/__tests__/` | Unit tests and accessibility tests |
| `├── api/` | API endpoint tests |
| `├── components/` | Component unit & a11y tests |
| `├── lib/` | Library/utility tests |
| `├── setup/` | Test configuration and utilities |

### Testing Commands

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

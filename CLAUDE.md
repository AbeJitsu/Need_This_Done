IMPORTANT: Interact with me and output content that sounds and feels inviting, focused, considerate, supportive, and influential all throughout and use language that's easy to understand. Speak as if speaking to a friend over coffee.

## Table of Contents

- [Quick Commands](#quick-commands)
- [Communication Preferences](#communication-preferences)
- [Development Workflow](#development--deployment-workflow)
- [Integration Status](#integration-status)
- [Key Utilities](#key-utilities-reference)
- [Puck Visual Builder](#puck-visual-builder)
- [Template System](#template-system)
- [API Patterns](#api-patterns)
- [Caching System](#caching-system)
- [Design System](#design-system)
- [Testing](#testing)
- [Autonomous Work Mode](#autonomous-work-mode)
- [Git Restrictions](#git--bash-command-restrictions)
- [Hooks](#hooks)

---

## Quick Commands

Commands you'll use most often:

| Command | What it does |
|---------|--------------|
| `cd app && npm run dev` | Start dev server at localhost:3000 |
| `cd app && npm run lint` | Run ESLint |
| `cd app && npm run type-check` | Check TypeScript |
| `cd app && npm test` | Run all tests |
| `cd app && npm run test:a11y` | Quick accessibility tests only |
| `cd app && npm run test:e2e:ui` | Interactive E2E testing |
| `cd app && npm run storybook` | Component development |
| `/dac` | Draft a commit message for approval |
| `/check-work` | Check current work status and git context |

---

## Communication Preferences

**Use ASCII workflow charts** when explaining:
- Complex flows or state changes
- Before/after comparisons
- Multi-step processes
- Problem → Solution explanations

Keep charts simple, use box-drawing characters, and label each step clearly.

---

## Development & Deployment Workflow

**Always follow this workflow:**

0. **Check TODO.md** for current priorities and what needs doing
1. **Local Development** (test changes first):
   - Run `cd app && npm run dev` to start Next.js dev server
   - Access at http://localhost:3000
   - Test all changes thoroughly
2. **Push to GitHub** (after local testing passes):
   - Run `/dac` to draft a commit message for approval
   - **NEVER commit directly** - always wait for user approval
   - Push changes to the `dev` branch after approval
3. **Production Deployment** (automatic via Vercel):
   - Push to `main` branch triggers Vercel deployment
   - Site runs at https://needthisdone.com

**Architecture:**
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (Medusa)
- **Database**: Supabase
- **Cache**: Upstash Redis

---

## Integration Status

Quick reference of what's production-ready vs in-progress:

| Component | Status | Notes |
|-----------|--------|-------|
| Medusa Backend | ✅ Ready | Products, carts, checkout |
| Stripe Payments | ✅ Ready | Real payment processing |
| Google OAuth | ✅ Ready | User sign-in |
| E2E Tests | ✅ Ready | 177 tests passing |
| Puck Page Builder | ⛔ Disabled | Not production ready - see below |

**Puck is currently disabled.** The visual page builder and template system are implemented but need E2E testing before production use. Admin UI link is commented out in `AdminDashboard.tsx`.

---

## Key Utilities Reference

Important files in `app/lib/` you'll use often:

| File | Purpose |
|------|---------|
| `colors.ts` | Centralized color system (WCAG AA compliant) |
| `api-auth.ts` | `verifyAdmin()`, `verifyAuth()` for API routes |
| `api-errors.ts` | `handleApiError()`, `badRequest()`, `unauthorized()` |
| `cache.ts` | Redis caching with `cache.wrap()`, TTL constants |
| `puck-config.tsx` | Puck component definitions (30+ components) |
| `puck-utils.tsx` | Puck color utilities and layout maps |
| `templates/` | Template system (types, utils, starter templates) |
| `medusa-client.ts` | E-commerce API client |
| `stripe.ts` | Payment processing (server-side only) |
| `email-service.ts` | Email sending functions |
| `validation.ts` | Input validation helpers |

---

## Puck Visual Builder

Puck enables drag-and-drop page building. Currently **disabled** pending E2E testing.

### 30+ Available Components

**Layout:** Spacer, Container, Columns, Divider, TextBlock
**Media:** Image, Hero, ImageText, ImageGallery, RichText, VideoEmbed
**Interactive:** Accordion, Tabs, FeatureGrid, Button, Card, CircleBadge
**E-Commerce:** ProductCard, ProductGrid, FeaturedProduct, PricingTable
**Social Proof:** Testimonials, StatsCounter
**CTA:** CTASection, PageHeader

### Puck Color Utilities

All Puck components use centralized colors from `lib/puck-utils.tsx`:

```typescript
import { getPuckAccentColors, getPuckFullColors } from '@/lib/puck-utils';

// Basic colors (bg, text, border, hover states)
const colors = getPuckAccentColors('purple');

// Full colors (includes buttonBg, iconBg, subtleBg, etc.)
const fullColors = getPuckFullColors('blue');
```

**Layout maps:** `puckColumnsMap`, `puckGapMap`, `puckAspectMap`, `puckContainerWidthMap`
**Icons:** `puckIcons` - 15+ SVG icons (star, check, heart, shield, etc.)

### Adding New Puck Components

Edit `lib/puck-config.tsx` and add to the `components` object. Each component needs:
- `fields` - Editor inputs (text, select, radio, etc.)
- `defaultProps` - Default values
- `render` - React component that renders the output

---

## Template System

Templates are pre-built page layouts users customize through a 5-step wizard.

### Architecture

```
lib/templates/
├── types.ts          # PageTemplate, TemplateSection, WizardState
├── config.ts         # CATEGORY_INFO, COLOR_OPTIONS
├── utils.ts          # filterByCategory, searchTemplates, etc.
├── starter-templates.ts  # Ready-to-use templates
└── index.ts          # Re-exports everything
```

### Template Categories

| Category | Purpose | Icon |
|----------|---------|------|
| landing | Sales pages, launches, promotions | 🚀 |
| course | Online courses, training programs | 📚 |
| shop | Products, collections, e-commerce | 🛒 |
| content | Blog, portfolio, about pages | 📝 |
| utility | Contact, thank you, simple pages | ⚙️ |

### Creating a New Template

Add to `lib/templates/starter-templates.ts`:

```typescript
export const myTemplate: PageTemplate = {
  id: 'my-template',
  name: 'My Template',
  description: 'What this template is for',
  category: 'landing',
  audience: 'business',
  tags: ['keyword1', 'keyword2'],
  defaultColor: 'purple',
  sections: [
    { type: 'Hero', props: { title: '...', subtitle: '...' } },
    { type: 'FeatureGrid', props: { features: [...] } },
    // ... more sections
  ],
  placeholders: [
    { id: 'headline', label: 'Headline', type: 'text', sectionIndex: 0, propPath: 'title' },
  ],
};
```

---

## API Patterns

### Authentication

```typescript
import { verifyAdmin, verifyAuth } from '@/lib/api-auth';

export async function GET() {
  // For admin-only routes
  const authResult = await verifyAdmin();
  if (authResult.error) return authResult.error;

  const user = authResult.user; // Guaranteed admin user
  // ... rest of handler
}
```

### Error Handling

```typescript
import { handleApiError, badRequest, unauthorized } from '@/lib/api-errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.requiredField) {
      return badRequest('requiredField is required');
    }

    // ... operation
  } catch (error) {
    return handleApiError(error, 'POST /api/endpoint');
  }
}
```

---

## Caching System

Redis caching with automatic JSON serialization and graceful degradation.

### TTL Constants

```typescript
import { cache, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';

CACHE_TTL.STATIC    // 1 hour - Static content
CACHE_TTL.LONG      // 5 minutes - User data
CACHE_TTL.MEDIUM    // 1 minute - Dashboard (default)
CACHE_TTL.SHORT     // 30 seconds - Frequently updated
CACHE_TTL.REALTIME  // 10 seconds - Near real-time
```

### Cache-Aside Pattern

```typescript
const result = await cache.wrap(
  CACHE_KEYS.userProjects(userId),
  async () => {
    // Only runs on cache miss
    const { data } = await supabase.from('projects').select('*');
    return data;
  },
  CACHE_TTL.MEDIUM
);

// result.data = the data
// result.cached = true if from cache
```

### Invalidation

```typescript
await cache.invalidate(CACHE_KEYS.userProjects(userId));
await cache.invalidatePattern('admin:projects:*');
```

**Dev mode:** Set `SKIP_CACHE=true` in `.env.local` to bypass Redis.

---

## Design System

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for technical standards.
See [.claude/DESIGN_BRIEF.md](.claude/DESIGN_BRIEF.md) for brand identity.

### Color System

**NEVER hardcode colors.** All colors come from [lib/colors.ts](app/lib/colors.ts).

```typescript
import { formInputColors, accentColors } from '@/lib/colors';

<p className={formInputColors.helper}>Helper text</p>
<button className={accentColors.purple.bg}>Click me</button>
```

See `app/lib/colors.ts` for the full list of available color objects.

### No Broken Windows Policy

**Fix warnings and errors immediately—don't ignore them.**

- Build warnings → fix before shipping
- Test failures → fix, don't skip
- TypeScript errors → resolve, don't `@ts-ignore`
- Linting failures → address, don't disable
- Half-done features → complete or remove

**Zero warnings in production code. Always.**

---

## Testing

See [docs/e2e-test-report.md](docs/e2e-test-report.md) for full coverage details.

**Quick commands:**
```bash
cd app && npm test              # All tests
cd app && npm run test:a11y     # Accessibility only
cd app && npm run test:e2e:ui   # Interactive E2E
```

**Adding tests:**
- Static pages → `e2e/pages.spec.ts`
- Dark mode → `e2e/pages-dark-mode.spec.ts`
- Navigation → `e2e/navigation.spec.ts`
- Protected routes → `e2e/dashboard.spec.ts`

**Visual regression:**
```bash
cd app && npx playwright test screenshots.spec.ts --update-snapshots
```

---

## Autonomous Work Mode

**When on an experiment branch**, work continuously without stopping:

1. **Don't stop for approvals** - Keep working through TODO.md items
2. **Implement → Test → Fix → Document** - Complete the full cycle
3. **Update TODO.md** as tasks complete
4. **Run tests after each change** - Fix any failures immediately
5. **Document completed features** in README.md
6. **Use agent swarms** - Launch parallel agents for thorough exploration

**Agent Swarm Strategy:**
- **Exploration:** Launch 2-3 Explore agents to search different areas
- **Implementation:** Break features into parallel workstreams
- **Documentation:** Document different sections simultaneously

**When to pause:**
- External service setup needed (Google Cloud Console, API keys)
- Destructive operations that can't be undone
- Ambiguous requirements with multiple valid approaches

---

## Git & Bash Command Restrictions

To keep things safe, certain commands are blocked by settings.json:

### ✅ Safe Commands (Always Allowed)

**Git read-only:** `git status`, `git log`, `git diff`, `git branch`
**Development:** `npm run dev`, `npm test`, `npm run build`, `npm run lint`
**File operations:** All Read, Edit, Write tool operations

### 🚫 Blocked Commands (Require User Approval)

**Git write:** `git commit`, `git push`, `git merge`, `git rebase`, `git checkout`
**Destructive:** `rm -rf`, `sudo`
**Secrets:** Reading/writing `.env` or `secrets.*` files

### What to Do When Blocked

1. Explain what you need to do and why
2. Ask the user to run it manually
3. Continue with the next step after they confirm

---

## Hooks

Five hooks in `.claude/hooks/` support your workflow:

| Hook | When | Purpose |
|------|------|---------|
| `session-start.sh` | Session starts/resumes | Shows TODO.md priorities |
| `post-tool-use.sh` | After Edit/Write on .ts/.tsx | Auto-runs ESLint --fix |
| `todo-sync.sh` | After TodoWrite | Reminds to update TODO.md |
| `stop-check.sh` | Before stopping | Blocks if >7 completed items |
| `user-prompt-submit.sh` | User submits prompt | Reminds to run tests |

**TODO.md is the source of truth.** Check it before starting work, update it when completing tasks.

---

## Task Tracking

**TODO.md** → Incomplete, untested features
**README.md** → Production-ready, battle-tested features

**Flow:** TODO.md (incomplete) → test & verify → README.md (production-ready)

---

## Project Overview

See [README.md](README.md) for directory structure, quick start, and deployment details.

## Coding Standards

Follow [.claude/INSTRUCTIONS.md](.claude/INSTRUCTIONS.md) for code organization and DRY principles.

---

*Last Updated: December 2025*

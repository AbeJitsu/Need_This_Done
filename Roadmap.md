# NeedThisDone.com - Roadmap

## Design Philosophy

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for complete standards.

- Conservative, professional design with warmth and polish
- DRY architecture with reusable components
- Motion-safe animations (respects prefers-reduced-motion)

---

## Completed

### Frontend (Phases 1-7)
- Homepage enhancements (typography, spacing, hover effects)
- Foundation components: PageHeader, Card, CTASection
- Page enhancements: Services, Pricing, How It Works, FAQ, Contact
- Component library: Button, ServiceCard, PricingCard, StepCard, CircleBadge
- Centralized color system with Tailwind safelist

### Backend (Phase 9a-b)
- Admin dashboard with user management
- Client dashboard with role-based routing

### Infrastructure (Redis Caching)
- Cache utility library with automatic JSON serialization (`app/lib/cache.ts`)
- Cache-first pattern applied to high-traffic routes
  - User dashboard (`/api/projects/mine`) - 60s TTL
  - Admin dashboard (`/api/projects/all`) - 60s TTL with status filters
  - Project comments (`/api/projects/[id]/comments`) - separate admin/client caches
  - User management (`/api/admin/users`) - 5min TTL
- Cache invalidation on all data mutations (POST/PATCH)
- Comprehensive caching strategy documentation in `docs/CACHING_STRATEGY.md`
- 60-80% reduction in database queries, 15-50x faster cache hits
- Graceful degradation when Redis unavailable

---

## Pending

### Email Notifications

**Prerequisites:**
- Sign up for [Resend](https://resend.com) (free: 3,000 emails/month)
- Add `RESEND_API_KEY` to `.env.local`
- Install: `npm install resend`

**Build:**
- Create `app/lib/email.ts` utility
- Admin alert on new project submission
- Client confirmation email (2 business day response)
- Hook into `/api/projects` POST handler

### Stripe Integration

**Current (Manual):**
- Create payment links in Stripe dashboard
- Send links manually after quoting

**Future (Automated):**
- Checkout session endpoint
- Payment link generation from admin panel
- Webhook integration for payment updates

---

## Next Steps


# Tech Stack & Architecture Handoff

## Overview

This document outlines our proposed technology stack, the architecture decisions behind it, and how each piece fits into the system. This is for new developers, team members, and future reference.

## The Stack

### Next.js
**What it does:** React framework for building the frontend with server-side rendering and API routes
**Why it matters:** Provides fast, SEO-friendly pages with built-in routing and optimization. Handles chat API routes. Industry standard for modern web apps.

### Nginx
**What it does:** Reverse proxy and web server that routes traffic to different services
**Why it matters:** Handles SSL, load balancing, and serves static files efficiently. Acts as the entry point for all requests.

### Redis
**What it does:** In-memory cache for storing frequently accessed data
**Why it matters:** Dramatically speeds up page loads by caching database queries and API responses. Reduces load on Supabase.

### Supabase
**What it does:** PostgreSQL database with pgvector extension for semantic search
**Why it matters:** Stores content, user data, AND vector embeddings for semantic search. Single source of truth for all data including auth, storage, and real-time features.

### Medusa
**What it does:** Headless ecommerce backend (cart, checkout, inventory, orders)
**Why it matters:** Handles all commerce logic so you don't build payment processing, tax calculations, and order management from scratch.

### Puck
**What it does:** Visual page builder that lets non-devs compose pages with React components
**Why it matters:** Clients can build and edit pages without touching code. Makes the platform accessible to non-technical users.

### Storybook
**What it does:** Component development environment for building and documenting UI components
**Why it matters:** Lets you build/test components in isolation before integrating them. Creates living documentation of available components.

### Tiptap
**What it does:** Modern WYSIWYG editor that supports embedded React components
**Why it matters:** Replaces TinyMCE with a flexible editor that can embed interactive elements (quizzes, flashcards) directly in content.

### Vercel AI SDK
**What it does:** React hooks and utilities for building AI chat interfaces
**Why it matters:** Handles chat state, streaming responses, and API integration. Makes adding AI chat trivial without building from scratch.

### OpenAI API
**What it does:** Embeddings for semantic search + chat completions
**Why it matters:** Powers vector search (text-embedding-3-small) and conversational AI (GPT-4 or Claude via API).

### Docker
**What it does:** Containerization platform for local development environment
**Why it matters:** Ensures everyone runs the same setup (Nginx, Redis, databases) without "works on my machine" problems.

## Data Flow

```
User Request
    ↓
Nginx (routes traffic)
    ↓
Next.js (renders pages)
    ├─→ Puck (builds dynamic layouts)
    ├─→ Redis (checks cache)
    └─→ Medusa API (commerce data) + Supabase (user data, auth)
```

## Key Architectural Decisions

### Headless Commerce
Medusa and Supabase are separate from the frontend. This means:
- The API layer is decoupled from presentation
- We can change UI without touching business logic
- APIs can be reused for mobile, third-party integrations, etc.

### Component-Driven Development
Storybook enforces this from day one:
- Every component is built in isolation, tested independently
- New developers see what components exist and how to use them
- Reduces "did my component break something elsewhere?" anxiety

### Caching Strategy (Redis)
Without Redis, every user interaction hits Supabase/Medusa:
- User loads product page → queries Supabase for product data
- User reloads → same query hits the database again
- Multiply this across thousands of users → degraded performance

Redis caches results, so repeat requests are instant. Cache invalidation rules TBD per feature.

### Deployed Storybook as Team Documentation
Storybook isn't just for developers:
- Product managers can see what components exist
- Designers can reference approved variations
- Future developers have a visual reference without reading code
- Reduces onboarding time and support requests

## Development Workflow

### Building Components
```bash
# 1. Build component in Next.js
# 2. Open Claude Code + use context7 for fresh Storybook docs
# 3. Generate story file with variants (loading, error, success states)
# 4. Verify stories render correctly
# 5. Component automatically available to Puck and other parts of the app
```

**Why this matters:** Claude Code with context7 ensures story syntax is always current. No outdated patterns. No "that doesn't work in the latest version" surprises.

### Deploying
```
Docker (local) → Nginx (staging) → Nginx (production)
```
Everything runs in containers, so what works locally works on the server.

## Why This Stack Works For Us

1. **Reduces boilerplate** - Supabase handles auth, Medusa handles commerce. We focus on UI/UX.
2. **Scales independently** - Each piece can be upgraded, replaced, or scaled without touching the others.
3. **Fast iteration** - Component-driven development + Storybook means changes are visible immediately and testable in isolation.
4. **Knowledge transfer** - Storybook is documentation. Redis/Nginx/Docker are industry-standard. New developers can contribute quickly.
5. **Future-proof** - Headless architecture means we can add mobile, CLI tools, or third-party integrations without major refactoring.

## Next Steps

- [x] Set up Storybook in Next.js project *(complete - http://localhost:6006)*
- [x] Set up Docker compose for local development stack *(complete)*
- [x] Configure context7 MCP for Claude Code workflows *(complete)*
- [ ] Deploy Storybook as static site served by Nginx at `/design`
- [ ] Define Redis cache invalidation strategy (per feature)
- [ ] Document Medusa API contract (endpoints, auth, data shape)

## Setup Guides (Pending)

- [Medusa Setup](app/guides/medusa-setup.md) - Headless commerce API, environment variables, Stripe
- [Puck Setup](app/guides/puck-setup.md) - Page builder config, dynamic routes, component exposure

## Questions or Changes?

This document should evolve. If a component doesn't serve the team, we change it. If a developer finds a better pattern, we document it here.

---

*Last Updated: December 4, 2025

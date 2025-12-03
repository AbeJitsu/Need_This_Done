# NeedThisDone.com - Roadmap

## Design Philosophy

- Conservative, professional design with warmth and polish
- WCAG AA accessibility (5:1 contrast minimum)
- Light and dark mode support
- Motion-safe animations (respects prefers-reduced-motion)
- DRY architecture with reusable components
- Single source of truth for colors in `app/lib/colors.ts`

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

| Component | Role | Why |
|-----------|------|-----|
| **Next.js** | Frontend framework | Server-side rendering + static generation, built-in API routes, seamless Supabase integration |
| **Nginx** | Reverse proxy / web server | Routes traffic, serves static assets, handles SSL, lightweight and battle-tested |
| **Redis** | In-memory cache | Reduces load on Supabase and Medusa by caching frequently accessed data (products, user sessions, etc.) |
| **Supabase** | Database + authentication | PostgreSQL backend with built-in auth, real-time subscriptions, eliminates backend boilerplate |
| **Medusa** | Headless commerce engine | Products, orders, carts, inventory—handled by Medusa so we focus on frontend experience |
| **Puck** | Page builder | Enables non-developers to compose layouts dynamically without touching code |
| **Storybook** | Component documentation | Every component has documented variations, states, and edge cases—deployed as team documentation |
| **Docker** | Containerization | Entire stack runs in containers for consistency across machines and easy deployment |

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

- [ ] Set up Storybook in Next.js project
- [ ] Deploy Storybook as static site served by Nginx at `/design`
- [ ] Configure context7 MCP for Claude Code workflows
- [ ] Define Redis cache invalidation strategy (per feature)
- [ ] Document Medusa API contract (endpoints, auth, data shape)
- [ ] Set up Docker compose for local development stack

## Setup Guides

- [Storybook Setup](app/guides/storybook-setup.md) - Next.js App Router integration, writing stories, deployment
- [Medusa Setup](app/guides/medusa-setup.md) - Headless commerce API, environment variables, Stripe
- [Puck Setup](app/guides/puck-setup.md) - Page builder config, dynamic routes, component exposure

## Questions or Changes?

This document should evolve. If a component doesn't serve the team, we change it. If a developer finds a better pattern, we document it here.

---

*Last Updated: December 2,2025

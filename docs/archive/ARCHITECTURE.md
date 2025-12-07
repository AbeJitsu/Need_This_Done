# Architecture & Tech Stack

## Overview

This document outlines our technology stack, the architecture decisions behind it, and how each piece fits into the system. This is for new developers, team members, and future reference.

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

## Why This Stack Works For Us

1. **Reduces boilerplate** - Supabase handles auth, Medusa handles commerce. We focus on UI/UX.
2. **Scales independently** - Each piece can be upgraded, replaced, or scaled without touching the others.
3. **Fast iteration** - Component-driven development + Storybook means changes are visible immediately and testable in isolation.
4. **Knowledge transfer** - Storybook is documentation. Redis/Nginx/Docker are industry-standard. New developers can contribute quickly.
5. **Future-proof** - Headless architecture means we can add mobile, CLI tools, or third-party integrations without major refactoring.

## Related Documentation

- [DOCKER.md](../DOCKER.md) - Docker setup, operations, and Supabase local development
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Design standards and accessibility requirements
- [MEDUSA_INTEGRATION.md](MEDUSA_INTEGRATION.md) - Ecommerce architecture and implementation
- [ECOMMERCE_QUICK_START.md](ECOMMERCE_QUICK_START.md) - Quick start guide for ecommerce development

---

*Last Updated: December 6, 2025*

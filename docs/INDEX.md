# Documentation Index

Complete guide to all documentation in the project. Find what you need based on your role and what you're trying to do.

---

## 🎯 Start Here Based on Your Role

### 👨‍💼 Business / Product Manager
- **[SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md)** - How the entire system works (no tech jargon)
- **[ECOMMERCE_QUICK_START.md](./ECOMMERCE_QUICK_START.md)** - Quick start for testing the shop

### 👨‍💻 Developer (Full Stack)
- **[SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md)** - Start here for context
- **[CART_SYSTEM.md](./CART_SYSTEM.md)** - How the cart system works (detailed)
- **[MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md)** - Full ecommerce architecture
- **[ECOMMERCE_QUICK_START.md](./ECOMMERCE_QUICK_START.md)** - Setup and common tasks
- **[PRE_MERGE_CHECKLIST.md](./PRE_MERGE_CHECKLIST.md)** - Testing before merging code
- **[CACHING_STRATEGY.md](./CACHING_STRATEGY.md)** - How caching works

### 🎨 Designer
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Colors, components, accessibility
- **[SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md)** - Understand the user flow

### 🏗️ DevOps / Infrastructure
- **[DOCKER.md](../DOCKER.md)** - Docker setup and architecture (see root)
- **[MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md)** - System components and deployment
- **[CACHING_STRATEGY.md](./CACHING_STRATEGY.md)** - Performance optimization

### 🧪 QA / Tester
- **[PRE_MERGE_CHECKLIST.md](./PRE_MERGE_CHECKLIST.md)** - Complete testing checklist
- **[ECOMMERCE_QUICK_START.md](./ECOMMERCE_QUICK_START.md)** - Manual testing flows
- **[SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md)** - Understand what you're testing

---

## 📚 Complete Documentation List

### Core System Documentation

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md) | How everything works (no tech jargon) | Everyone | 15 min read |
| [CART_SYSTEM.md](./CART_SYSTEM.md) | Shopping cart architecture & implementation | Developers | 20 min read |
| [MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md) | Full ecommerce architecture & APIs | Developers | 25 min read |
| [ECOMMERCE_QUICK_START.md](./ECOMMERCE_QUICK_START.md) | Quick start, setup, common tasks | Everyone | 10 min read |

### Operations & Quality

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [PRE_MERGE_CHECKLIST.md](./PRE_MERGE_CHECKLIST.md) | Testing checklist before merging code | Developers | 15 min checklist |
| [CACHING_STRATEGY.md](./CACHING_STRATEGY.md) | How Redis cache works | Developers | 10 min read |
| [dark-mode-testing.md](./dark-mode-testing.md) | Testing dark mode + WCAG compliance | QA/Designers | 5 min read |

### Design & Standards

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, components, accessibility | Designers/Developers | 15 min read |

### Configuration & Setup

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| [URL_CONFIGURATION.md](./url-configuration.md) | URL and redirect configuration | Developers | 5 min read |

---

## 🔗 Navigation Guide

### "I want to..."

**...understand how the business works**
→ [SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md)

**...set up the project locally**
→ [ECOMMERCE_QUICK_START.md](./ECOMMERCE_QUICK_START.md)

**...understand the shopping cart**
→ [CART_SYSTEM.md](./CART_SYSTEM.md)

**...implement a new ecommerce feature**
→ [MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md)

**...test before merging to dev**
→ [PRE_MERGE_CHECKLIST.md](./PRE_MERGE_CHECKLIST.md)

**...design a new component**
→ [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

**...improve page performance**
→ [CACHING_STRATEGY.md](./CACHING_STRATEGY.md)

**...configure URLs/redirects**
→ [URL_CONFIGURATION.md](./url-configuration.md)

**...test dark mode**
→ [dark-mode-testing.md](./dark-mode-testing.md)

---

## 📋 Documentation Map

```
docs/
├── INDEX.md (← You are here)
├── SYSTEM_OVERVIEW_FOR_EVERYONE.md (Non-technical guide)
├── CART_SYSTEM.md (Cart architecture)
├── MEDUSA_INTEGRATION.md (Ecommerce architecture)
├── ECOMMERCE_QUICK_START.md (Setup & quick start)
├── PRE_MERGE_CHECKLIST.md (Testing checklist)
├── CACHING_STRATEGY.md (Performance & caching)
├── DESIGN_SYSTEM.md (Design standards)
├── URL_CONFIGURATION.md (URL configuration)
└── dark-mode-testing.md (Dark mode testing)
```

---

## 🎓 Learning Paths

### Path 1: New Developer (2 hours)

1. **[SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md)** (15 min)
   - Understand what the business does and how systems connect

2. **[ECOMMERCE_QUICK_START.md](./ECOMMERCE_QUICK_START.md)** (15 min)
   - Get the system running locally

3. **[CART_SYSTEM.md](./CART_SYSTEM.md)** (20 min)
   - Deep dive into how the cart works

4. **[MEDUSA_INTEGRATION.md](./MEDUSA_INTEGRATION.md)** (20 min)
   - Understand complete ecommerce architecture

5. **[CACHING_STRATEGY.md](./CACHING_STRATEGY.md)** (10 min)
   - Learn how performance optimization works

6. **Explore code** (40 min)
   - Read [medusa/src/index.ts] - Cart backend implementation
   - Read [app/context/CartContext.tsx] - Cart frontend state
   - Read tests [app/e2e/shop-cart.spec.ts] - See what features work

### Path 2: Testing Code Before Merge (1 hour)

1. **[PRE_MERGE_CHECKLIST.md](./PRE_MERGE_CHECKLIST.md)** (5 min)
   - Understand what you need to test

2. **Manual Testing** (20 min)
   - Follow each functional test
   - Add items, remove items, verify cart persists

3. **E2E Tests** (10 min)
   - Run automated test suite
   - See passing tests for cart functionality

4. **Code Quality** (10 min)
   - TypeScript checks
   - ESLint checks
   - Build verification

5. **Backend Verification** (10 min)
   - Test Medusa endpoints directly
   - Verify cart API responses

### Path 3: Implementing New Features (varies)

1. Start with [SYSTEM_OVERVIEW_FOR_EVERYONE.md](./SYSTEM_OVERVIEW_FOR_EVERYONE.md) for context
2. Find relevant architecture doc (CART_SYSTEM, MEDUSA_INTEGRATION, etc.)
3. Check [PRE_MERGE_CHECKLIST.md](./PRE_MERGE_CHECKLIST.md) for how to test
4. Read related source code
5. Make changes
6. Run through merge checklist

---

## 🚀 Quick Reference Commands

### Development

```bash
# Start everything
docker-compose up -d

# Run tests
cd app && npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

### Debugging

```bash
# View app logs
docker-compose logs app

# View medusa logs
docker-compose logs medusa

# SSH into app container
docker exec -it app sh

# Clear cache
redis-cli FLUSHALL
```

---

## 📞 Getting Help

**If you're stuck...**

1. **Check the relevant documentation** - Most questions are answered there
2. **Search the code** - Source code often explains things best
3. **Check error logs** - `docker-compose logs app`
4. **Ask the team** - We're happy to explain
5. **Read tests** - Tests show expected behavior

---

## 🔄 Documentation Status

**Current As Of**: December 2025

| Document | Status | Last Updated | Notes |
|----------|--------|--------------|-------|
| SYSTEM_OVERVIEW_FOR_EVERYONE.md | ✅ Current | Dec 2025 | Brand new, comprehensive |
| CART_SYSTEM.md | ✅ Current | Dec 2025 | Brand new, in-depth |
| PRE_MERGE_CHECKLIST.md | ✅ Current | Dec 2025 | Brand new, tested |
| ECOMMERCE_QUICK_START.md | ✅ Current | Dec 2025 | Still relevant |
| MEDUSA_INTEGRATION.md | ✅ Current | Dec 2025 | Architecture still valid |
| DESIGN_SYSTEM.md | ✅ Current | Dec 2025 | Still relevant |
| CACHING_STRATEGY.md | ✅ Current | Dec 2025 | Still relevant |
| URL_CONFIGURATION.md | ✅ Current | Dec 2025 | Still relevant |
| dark-mode-testing.md | ✅ Current | Dec 2025 | Still relevant |

---

## 🗑️ Deprecated Documentation

The following documents are no longer maintained:
- ~~`dev-preview-urls.md`~~ - Feature no longer core to system

If you reference something from this list, update it with current information first!

---

## 📝 Contributing to Documentation

If you improve or update documentation:

1. Update the timestamp in this INDEX.md
2. Be clear and concise
3. Add examples when possible
4. Link to related docs
5. Mention who the audience is

**Good documentation saves hours of debugging later.** 🎉

---

## Questions About Documentation?

If something is:
- **Unclear** - Add an example or rewrite more clearly
- **Missing** - Create a new doc and link it here
- **Outdated** - Update it and change the status above
- **Incomplete** - Add a TODO comment and update status

Great documentation is a team effort!

---

**Last Updated**: December 2025
**Maintained By**: Development Team
**Status**: Active & Growing

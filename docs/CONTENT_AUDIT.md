# Content Audit - NeedThisDone

> Generated: January 15, 2026
> Purpose: Ensure consistent product/service messaging across all pages

---

## Current Product Structure

### The 3 Core Services

| Service | Tagline | Color | Starting Price |
|---------|---------|-------|----------------|
| **Website Builds** | Your digital foundation | Green | $500 one-time |
| **Automation Setup** | Stop doing repetitive work | Blue | $150 per workflow |
| **Managed AI Services** | AI that runs while you sleep | Purple | $500/month |

### The 3 Consultations (Shop)

| Name | Duration | Price | Purpose |
|------|----------|-------|---------|
| Quick Chat | 15 min | $20 | Got a quick question? |
| Strategy Call | 30 min | $35 | Let's map out your needs |
| Deep Dive | 55 min | $50 | Full project consultation |

---

## Page-by-Page Content Map

### Homepage (`/`)
- **Hero**: "Websites. Automation. AI."
- **Services Section**: 3 service cards with modals
- **Consultations**: NOW REPLACED with single CTA (no prices shown)
- **How It Works Preview**: 4-step process teaser
- **Final CTA**: "Ready to Build?"

### Services Page (`/services`)
- **Header**: "Three Ways to Grow"
- **Scenario Matcher**: Links scenarios to services
- **Comparison Table**: Side-by-side service features
- **What to Expect**: 4 trust-building items
- **Note**: Static component, NOT inline-editable

### Pricing Page (`/pricing`)
- **3 Pricing Cards**: Website, Automation, Managed AI
- **Payment Terms**: 50% deposit, 50% on delivery
- **Alternative Paths**: Quote or Strategy Call
- **Inline-editable**: Yes

### Shop Page (`/shop`)
- **Products from Medusa**: 3 consultations
- **Note**: Prices managed in Medusa backend, not in config

### How It Works (`/how-it-works`)
- **4-Step Process**: Tell Us → Get Quote → We Build → You Launch
- **Trust Badges**: Human + AI, Clear Updates, No Surprises
- **Timeline explanation per service**

### FAQ (`/faq`)
- **8 Questions** covering services, pricing, process
- **Mentions all 3 services and pricing**

### Contact (`/contact`)
- **Form with service dropdown**: Website Builds, Automation Setup, Managed AI Services, Not Sure Yet
- **File upload**: Up to 3 files, 5MB each

### About (`/about`)
- **Abe Reyes bio**: Background, approach, AI usage
- **Note**: Hardcoded, NOT inline-editable

---

## Naming Inconsistencies Found

| Issue | Where | Fix Needed |
|-------|-------|------------|
| "Website Build" vs "Website Builds" | Pricing cards use singular | Standardize to plural |
| "Managed AI" vs "Managed AI Services" | Various pages | Standardize to "Managed AI Services" |

---

## Files to Edit for Consistency

### Central Config (Source of Truth)
```
app/config/site.config.ts     - Site-wide settings
app/lib/page-config.ts        - All page content
```

### Service Modal Content
```
app/lib/service-modal-content.ts  - Modal headlines & bullets
app/lib/service-colors.ts         - Service → color mapping
```

### Static Pages (Need Manual Updates)
```
app/app/services/page.tsx     - Services comparison (not editable)
app/app/about/page.tsx        - About page (hardcoded)
```

### Medusa Products
- Managed in Medusa backend (Railway)
- API: `/api/shop/products`
- Updates require Medusa admin or API calls

---

## Questions for Product Strategy

Before making changes, consider:

1. **Should consultations stay as paid products?**
   - Currently $20-$50 in Medusa shop
   - Homepage no longer shows prices
   - Shop page still shows "Add to Cart"

2. **Are all 3 services still the core offering?**
   - Website Builds
   - Automation Setup
   - Managed AI Services

3. **What's the primary CTA path?**
   - Get a Quote (free) → Contact form
   - Book a Call (paid) → Shop checkout
   - Which should be emphasized?

4. **Pricing visibility strategy?**
   - Homepage: No prices (removed)
   - Pricing page: Full pricing
   - Services page: Starting prices in comparison table
   - FAQ: Mentions starting prices

---

## Consistency Checklist

When updating content, verify:

- [ ] Service names match across all pages
- [ ] Pricing matches between Pricing page, FAQ, Services comparison
- [ ] Color coding consistent (Green=Website, Blue=Automation, Purple=AI)
- [ ] Taglines identical wherever used
- [ ] CTAs use consistent wording
- [ ] Contact form dropdown matches service names

---

## Technical Notes

### Inline-Editable Pages
Homepage, Pricing, FAQ, How It Works, Contact, Get Started, Blog, Guide

### Not Editable (Static Components)
Services, About, Privacy, Terms, Login

### Content API Pattern
```
GET /api/page-content/[slug]  - Returns page content with defaults
```

### Shop Products
```
GET /api/shop/products        - Returns Medusa products
```

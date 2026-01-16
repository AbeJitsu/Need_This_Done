# Framer Motion Implementation Plan

## Overview

Add subtle, professional scroll-triggered animations to all customer-facing pages using Framer Motion. Animations should feel premium but understated - fade and gentle slide effects that enhance without distracting.

---

## Customer-Facing Pages (22 total)

### Core Marketing Pages
| Page | Path | Priority |
|------|------|----------|
| Homepage | `/` | High |
| Services | `/services` | High |
| Pricing | `/pricing` | High |
| How It Works | `/how-it-works` | High |
| About | `/about` | High |
| Contact | `/contact` | High |
| FAQ | `/faq` | High |
| Get Started | `/get-started` | High |

### Content Pages
| Page | Path | Priority |
|------|------|----------|
| Blog Listing | `/blog` | Medium |
| Blog Post | `/blog/[slug]` | Medium |
| Guide | `/guide` | Medium |
| Resume | `/resume` | Medium |

### E-Commerce Pages
| Page | Path | Priority |
|------|------|----------|
| Shop | `/shop` | Medium |
| Product Detail | `/shop/[productId]` | Medium |
| Cart | `/cart` | Medium |
| Checkout | `/checkout` | Low (focus on function) |

### Utility Pages
| Page | Path | Priority |
|------|------|----------|
| Privacy | `/privacy` | Low |
| Terms | `/terms` | Low |
| Build | `/build` | Low |
| Build Success | `/build/success` | Low |
| Pricing Success | `/pricing/success` | Low |
| Dynamic Pages | `/[slug]` | Low |

---

## Animation Components to Create

### 1. `FadeIn` - Basic reveal animation
```
Purpose: Fade element in on load or when entering viewport
Props:
  - delay?: number (stagger timing)
  - duration?: number (default 0.5s)
  - direction?: 'up' | 'down' | 'left' | 'right' | 'none' (default 'up')
  - distance?: number (pixels to travel, default 20, reduced on mobile)
  - once?: boolean (animate only first time, default true)
```

### 2. `StaggerContainer` - Parent for staggered children
```
Purpose: Animate children one after another
Props:
  - staggerDelay?: number (time between children, default 0.1s)
  - delayStart?: number (initial delay before first child)
```

### 3. `StaggerItem` - Child of StaggerContainer
```
Purpose: Individual item that participates in stagger
Props:
  - direction?: 'up' | 'down' | 'left' | 'right' | 'none'
```

### 4. `RevealSection` - Section-level reveal
```
Purpose: Reveal entire sections as they scroll into view
Props:
  - threshold?: number (how much visible before trigger, default 0.2)
  - className?: string (pass through styling)
```

---

## Animation Specifications

### Timing & Easing
| Property | Value | Rationale |
|----------|-------|-----------|
| Duration | 0.5-0.6s | Noticeable but not slow |
| Easing | easeOut | Natural deceleration |
| Stagger delay | 0.08-0.1s | Quick enough to feel connected |
| Viewport threshold | 0.2 (20%) | Triggers before fully visible |

### Desktop vs Mobile
| Property | Desktop | Mobile |
|----------|---------|--------|
| Slide distance | 20-30px | 15px |
| Duration | 0.5s | 0.4s |
| Stagger delay | 0.1s | 0.08s |

### Reduced Motion
When user prefers reduced motion:
- Disable all slide/transform animations
- Keep subtle fade (opacity only)
- Reduce duration to 0.3s

---

## File Structure

```
app/components/motion/
├── index.ts              # Barrel export
├── FadeIn.tsx            # Basic fade + slide
├── StaggerContainer.tsx  # Parent for staggered items
├── StaggerItem.tsx       # Child item for stagger
├── RevealSection.tsx     # Section-level wrapper
├── useReducedMotion.ts   # Hook for accessibility
└── variants.ts           # Shared animation variants
```

---

## Implementation Order

### Phase 1: Foundation
1. Install framer-motion package
2. Create animation components in `app/components/motion/`
3. Create `useReducedMotion` hook
4. Add Framer Motion to resume skills section

### Phase 2: Resume Page (Proof of Concept)
1. Apply animations to `/resume` page
2. Test on desktop and mobile
3. Verify reduced motion behavior
4. Validate no layout shift or performance issues

### Phase 3: Core Marketing Pages
Apply animations to high-priority pages in this order:
1. Homepage (`/`)
2. Services (`/services`)
3. Pricing (`/pricing`)
4. How It Works (`/how-it-works`)
5. About (`/about`)
6. Contact (`/contact`)
7. FAQ (`/faq`)
8. Get Started (`/get-started`)

### Phase 4: Content & E-Commerce Pages
1. Blog listing and posts
2. Shop and product pages
3. Cart page
4. Guide page

### Phase 5: Utility Pages
1. Privacy/Terms (minimal - just section reveals)
2. Success pages
3. Build pages

---

## Animation Patterns by Element Type

### Page Headers/Heroes
```
- Title: FadeIn direction="up" delay={0}
- Subtitle: FadeIn direction="up" delay={0.1}
- CTA buttons: FadeIn direction="up" delay={0.2}
```

### Section Cards (grids of 3-6 items)
```
- Section title: FadeIn once on scroll
- Cards: StaggerContainer with StaggerItem children
```

### Lists (experience, education, FAQs)
```
- Each item: FadeIn with incremental delay
- Or: StaggerContainer for automatic timing
```

### Single Content Blocks
```
- RevealSection wrapper for the whole block
```

---

## Testing Requirements

### Functional Tests
- [ ] Animations trigger on scroll
- [ ] Animations trigger on page load (above-fold content)
- [ ] Stagger timing feels natural
- [ ] No layout shift during animation

### Accessibility Tests
- [ ] Reduced motion preference respected
- [ ] Content still accessible without animations
- [ ] No seizure-inducing flash or rapid movement

### Performance Tests
- [ ] No jank on scroll
- [ ] Mobile performance acceptable
- [ ] Lighthouse score not degraded

### Cross-Browser
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari
- [ ] Chrome Android

---

## Migration Notes

### Existing CSS Animations
The codebase has CSS animations in `globals.css`:
- `animate-slide-up`
- `animate-fade-in`
- `animate-delay-*`

**Strategy**: Keep existing CSS animations for simple cases. Use Framer Motion for:
- Scroll-triggered reveals
- Staggered children
- More complex timing control

No need to remove existing animations - they can coexist.

### Client Components
Pages using animations need `"use client"` directive. Most marketing pages already have client components (`*PageClient.tsx`) for inline editing, so this fits the existing pattern.

---

## Success Criteria

1. All customer-facing pages have subtle entrance animations
2. Scroll-triggered reveals work on all sections
3. Staggered animations on card grids and lists
4. Mobile animations are toned down
5. Reduced motion users get fade-only or no animation
6. No performance regression
7. "Framer Motion" added to resume skills

---

## Questions Resolved

| Question | Decision |
|----------|----------|
| Animation style | Subtle fades, gentle slides, professional |
| Mobile treatment | Toned down (shorter distances, faster) |
| Reduced motion | Fade only, no movement |
| Library | Framer Motion |
| Scope | All 22 customer-facing pages |

---

## Estimated Scope

- **Phase 1 (Foundation)**: Create 5-6 component files
- **Phase 2 (Resume)**: 1 page, proof of concept
- **Phase 3 (Core)**: 8 pages
- **Phase 4 (Content/E-Commerce)**: 6 pages
- **Phase 5 (Utility)**: 6 pages (minimal changes)

Total: ~22 pages with animation, 6 reusable components

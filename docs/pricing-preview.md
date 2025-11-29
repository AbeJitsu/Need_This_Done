# Pricing Page Preview

## URL: `/pricing`

## ASCII Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    NAVIGATION                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              PAGE HEADER (PageHeader)                           │
│                                                                                 │
│                            Pick Your Perfect Fit                                │
│                                 (h1, bold)                                      │
│                                                                                 │
│       Every project is different—here's a starting point. Not sure which        │
│                  one? Just ask, we'll help you figure it out.                   │
│                               (gray text)                                       │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                          PRICING CARDS (3-column grid)                          │
│                      Staggered fade-in animation on load                        │
│                                                                                 │
│  ┌─────────────────────┐  ┌───────────────────────────┐  ┌─────────────────────┐│
│  │                     │  │     ⭐ Most Popular        │  │                     ││
│  │     QUICK TASK      │  │═══════════════════════════│  │  PREMIUM SERVICE    ││
│  │      (purple)       │  │                           │  │     (green)         ││
│  │                     │  │      STANDARD TASK        │  │                     ││
│  │       $50           │  │         (blue)            │  │       $500          ││
│  │   starting per task │  │       scale: 105%         │  │  starting per proj  ││
│  │                     │  │      blue glow shadow     │  │                     ││
│  │  Need something     │  │                           │  │  For the big stuff  ││
│  │  done fast?...      │  │         $150              │  │  We'll be with you  ││
│  │                     │  │    starting per task      │  │  every step...      ││
│  │  ✓ Content updates  │  │                           │  │                     ││
│  │  ✓ Data entry       │  │  Our most popular...      │  │  ✓ Website builds   ││
│  │  ✓ Document format  │  │                           │  │  ✓ E-commerce setup ││
│  │  ✓ Done in days     │  │  ✓ Research projects      │  │  ✓ Multi-phase      ││
│  │                     │  │  ✓ Spreadsheet org        │  │  ✓ Dedicated contact││
│  │ ┌─────────────────┐ │  │  ✓ Multi-step tasks       │  │                     ││
│  │ │ Let's Do This   │ │  │  ✓ Revisions included     │  │ ┌─────────────────┐ ││
│  │ │    (purple)     │ │  │                           │  │ │   Let's Chat    │ ││
│  │ └─────────────────┘ │  │ ┌───────────────────────┐ │  │ │    (green)      │ ││
│  │                     │  │ │     Let's Chat        │ │  │ └─────────────────┘ ││
│  │  border-t: purple   │  │ │       (blue)          │ │  │                     ││
│  │  hover: purple      │  │ └───────────────────────┘ │  │  border-t: green    ││
│  └─────────────────────┘  │                           │  │  hover: green       ││
│                           │  border: 2px blue         │  └─────────────────────┘│
│                           │  border-t: blue           │                         │
│                           │  hover: blue              │                         │
│                           └───────────────────────────┘                         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                            CUSTOM TASKS (Card component)                        │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │                      Something Else in Mind?                              │  │
│  │                           (h2, bold)                                      │  │
│  │                                                                           │  │
│  │       Every project is unique. Tell us what you're working on and         │  │
│  │          we'll figure out the best approach together—no commitment.       │  │
│  │                               (gray text)                                 │  │
│  │                                                                           │  │
│  │                    ┌─────────────────────────┐                            │  │
│  │                    │  Let's Figure It Out    │                            │  │
│  │                    │       (orange)          │                            │  │
│  │                    └─────────────────────────┘                            │  │
│  │                                                                           │  │
│  │  border: 2px gray                                                         │  │
│  │  hover: orange (glow effect)                                              │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              FAQ TEASER                                         │
│                                                                                 │
│                 Still have questions? We've got answers.                        │
│                               (gray text)                                       │
│                                                                                 │
│                           Read our FAQ →                                        │
│                      (purple link, underline on hover)                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

| Section | Component | Border | Hover | Notes |
|---------|-----------|--------|-------|-------|
| Header | PageHeader | none | none | Centered title + description |
| Quick Task | PricingCard | 1px gray, 4px purple top | purple border | Fade-in animation |
| Standard Task | PricingCard | 2px blue, 4px blue top | blue border | Scale 105%, blue glow, "Most Popular" badge |
| Premium Service | PricingCard | 1px gray, 4px green top | green border | Fade-in with 200ms delay |
| Custom Tasks | Card | 2px gray | orange glow | Uses shared Card component |
| FAQ Teaser | native elements | none | underline | Simple text + link |

---

## Pricing Tiers

| Tier | Color | Price | Period | CTA | Notes |
|------|-------|-------|--------|-----|-------|
| Quick Task | Purple | $50 | per task | "Let's Do This" | Fast turnaround |
| Standard Task | Blue | $150 | per task | "Let's Chat" | Most Popular (badge + scale) |
| Premium Service | Green | $500 | per project | "Let's Chat" | Dedicated support |

---

## Visual Enhancements

### Most Popular Card
- **Scale**: 105% larger than other cards
- **Shadow**: `shadow-lg shadow-blue-200/50` (light) / `shadow-blue-900/30` (dark)
- **Badge**: Gradient blue pill with star emoji, positioned above card
- **z-index**: 10 to appear above adjacent cards

### Staggered Animations
- Card 1: `motion-safe:animate-fade-in` (immediate)
- Card 2: `motion-safe:animate-fade-in-delay-100` (100ms delay)
- Card 3: `motion-safe:animate-fade-in-delay-200` (200ms delay)
- Respects `prefers-reduced-motion`

### Typography
- **Prices**: `text-5xl` with color accent (purple/blue/green)
- **"starting per task"**: Subtle gray-500 text below price
- **Tier names**: `text-xl` with matching color

### Feature Checkmarks
- SVG checkmark icons (not text ✓)
- Color-matched circles with light backgrounds
- `items-start` alignment for multi-line features

---

## Files Involved

- `app/app/pricing/page.tsx` - Main page with tier data
- `app/components/PricingCard.tsx` - Individual pricing card
- `app/components/PageHeader.tsx` - Header component
- `app/components/Card.tsx` - Custom tasks container
- `app/components/Button.tsx` - CTA buttons
- `app/lib/colors.ts` - Color utilities
- `app/app/globals.css` - Animation keyframes

---

## Accessibility

- Animations respect `prefers-reduced-motion`
- All text meets 5:1 contrast ratio (WCAG AA)
- Focus states preserved on all interactive elements
- Semantic HTML structure maintained
- Screen reader friendly

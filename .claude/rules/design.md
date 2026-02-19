# Design System & Brand

## Brand Identity

**Purpose**: Professional project services platform that helps people get work done right.

**Personality**: Professional and trustworthy (foundation), warm and approachable (not cold), creative and energetic (not generic), supportive and capable (inspires confidence).

**Encouraged**: Subtle animations, dramatic typography, creative layouts, glassmorphism, floating effects.
**Preserve**: Professional tone, BJJ belt color progression, accessibility standards, existing component APIs.

## BJJ Belt Color System

The founder is a Brazilian Jiu-Jitsu purple belt. Colors follow belt progression:

| Priority | Belt | Tailwind | Meaning | Usage |
|----------|------|----------|---------|-------|
| 1st | Green | `emerald-*` | Growth, action | Primary CTAs, success states |
| 2nd | Blue | `blue-*` | Trust, professionalism | Links, secondary buttons |
| 3rd | Purple | `purple-*` | Creativity, mastery | Tertiary accents, special emphasis |
| 4th | Gold | `gold-*` | Achievement, warmth | Warm highlights, dark bg links |

**Element count guide**: 3 elements → Green→Blue→Purple. 4 → add Gold. 5 → add Black (gray-800/900).

**Avoid**: Orange/amber for text — use gold instead.

**Centralized colors**: `app/lib/colors.ts` has `accentColors`, `titleColors`, `gradients`. Extend, don't replace. For simple one-off colors, Tailwind classes are fine.

## Accessibility (WCAG AA)

We target **5:1 minimum** for all text. Dark mode is currently disabled.

| Element | Min Ratio |
|---------|-----------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components (borders, icons) | 3:1 |

### Minimum Compliant Shades (on white)

| Color | Min Text | Min Border |
|-------|----------|------------|
| Emerald | -600 | -500 |
| Blue | -600 | -500 |
| Purple | -600 | -500 |
| Gold | -700 | -500 |
| Gray | -600 | -400 |
| Stone | -600 | -500 |
| Red | -600 | -500 |

**Critical**: `stone-400` (2.52:1) fails 3:1 — use `stone-500` minimum.
**Reference**: `app/color-contrast-viewer.html` — full palette with ratios.

## Visual Effects

**Glassmorphism Cards** (light backgrounds):
```css
bg-gradient-to-r from-gray-100 to-white shadow-xl border border-gray-100
```

**Backlight Glow** (dark backgrounds):
```css
box-shadow: 0 0 40px rgba(255,255,255,0.18), 0 0 70px rgba(255,255,255,0.1)
```

**Floating Buttons** (colored shadows matching button):
```css
shadow-lg shadow-emerald-500/25  /* green */
shadow-lg shadow-blue-500/25     /* blue */
shadow-lg shadow-purple-500/25   /* purple */
```

## Dark Hero Section Pattern

All page hero sections use a consistent dark treatment with BJJ belt gradient accents:

| Element | Pattern |
|---------|---------|
| Section bg | `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` |
| Glow orb (top-left) | `bg-emerald-500/10` or `bg-blue-500/10` — w-[500px] h-[500px] blur-3xl -translate-x/y-1/2 |
| Glow orb (bottom-right) | `bg-purple-500/10` — w-[400px] h-[400px] blur-3xl translate-x/y-1/3 |
| Accent line | `bg-gradient-to-r from-emerald-400 to-blue-400` (or `via-blue-400 to-purple-400` for 3-stop) |
| Title gradient text | `bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400` |
| Content wrapper | `relative z-10 max-w-{5xl|6xl} mx-auto px-6 sm:px-8 md:px-12 pt-16 md:pt-20 pb-16 md:pb-20` |

**Never use** `purple-400/gold-400` or `amber-400` for hero accent gradients — always green→blue→purple.

## Component Patterns

Check `app/components/` before building new:
- **Layout**: Card, PageHeader, CTASection
- **Content**: ServiceCard, PricingCard, StepCard, FeatureCard
- **UI**: Button, CircleBadge

**New interactive components** need `.a11y.test.tsx` files.

## Typography

- **Font**: Inter (clean, modern sans-serif)
- **Style**: Clean, spacious layouts with card-based interfaces

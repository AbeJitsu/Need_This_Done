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

## Component Patterns

Check `app/components/` before building new:
- **Layout**: Card, PageHeader, CTASection
- **Content**: ServiceCard, PricingCard, StepCard, FeatureCard
- **UI**: Button, CircleBadge

**New interactive components** need `.a11y.test.tsx` files.

## Typography

- **Font**: Inter (clean, modern sans-serif)
- **Style**: Clean, spacious layouts with card-based interfaces

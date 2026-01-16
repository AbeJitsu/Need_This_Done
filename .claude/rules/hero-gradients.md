# Hero Gradient Pattern Rule

Hero sections use a "framing" gradient pattern where sides are darker and the middle is lighter. This creates visual depth that surrounds content.

## The Pattern

```
┌──────────────────────────────────────────────────────────────────┐
│  ╭───╮                                                           │
│ ╱     ╲  spot1: -top-32 -right-32 (pulled outside viewport)     │
│ ╲     ╱                                                          │
│  ╰───╯            ╭──╮  spot3: top-20 left-1/4 (inner accent)   │
│                   ╰──╯                                           │
│                                                                  │
│                    [ CONTENT AREA ]                              │
│                    (lighter center)                              │
│                                                                  │
│   ╭───╮                                                          │
│  ╱     ╲  spot2: -bottom-20 -left-20 (pulled outside viewport)  │
│  ╲     ╱                                                         │
│   ╰───╯                                                          │
└──────────────────────────────────────────────────────────────────┘
```

## Required Elements

Every hero section needs:

```tsx
<section className="relative overflow-hidden">
  {/* Base gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-{color}-50/80 via-white to-{accent}-50/50" />

  {/* Spot 1: Large orb, top-right, NEGATIVE margins */}
  <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-{color}-100 to-{shade}-100 blur-3xl" />

  {/* Spot 2: Medium orb, bottom-left, NEGATIVE margins */}
  <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-{accent}-100 to-{shade}-100 blur-2xl" />

  {/* Spot 3: Small accent, inner position */}
  <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-{color}-100 blur-xl" />

  {/* Content with relative positioning */}
  <div className="relative">
    {/* Page content here */}
  </div>
</section>
```

## Critical Rules

| Rule | Correct | Wrong |
|------|---------|-------|
| Positioning | `-top-32 -right-32` | `top-0 right-0` |
| Opacity | No opacity class | `opacity-60` |
| Colors | Full saturation `-100` | Muted `-50` |
| Blur levels | `blur-3xl`, `blur-2xl`, `blur-xl` | `blur-lg` |

## Color Themes by Page

| Page | Theme | Primary Colors |
|------|-------|----------------|
| Homepage | Blue/Purple | `blue-100`, `purple-100` |
| Services | Teal/Cyan | `teal-100`, `cyan-100` |
| Shop/Pricing | Purple/Blue | `purple-100`, `violet-100` |
| About | Amber/Blue | `amber-100`, `gold-100` |
| Blog | Purple/Gold | `purple-100`, `amber-100` |
| Legal pages | Slate/Gray | `slate-100`, `gray-100` |

## Using premium-design.ts

For new pages, use the centralized utility:

```tsx
import { heroGradient } from '@/lib/premium-design';

// Then render all three spots
<div className={heroGradient.teal.spot1} />
<div className={heroGradient.teal.spot2} />
<div className={heroGradient.teal.spot3} />
```

## Why Negative Margins?

Negative margins pull gradient orbs outside the viewport edges, creating a "framing" effect where:
- Sides of the page feel more saturated/colorful
- Center of the page feels lighter and cleaner
- Content sits in a visually balanced space
- The effect is subtle but premium

## Anti-Patterns

- **Corner-stuck gradients**: Using `top-0 right-0` makes orbs feel disconnected
- **Transparent gradients**: Adding opacity makes the effect too subtle/invisible
- **Missing inner accent**: Without spot3, the composition feels unbalanced
- **Low blur**: Using `blur-lg` instead of `blur-3xl` makes orbs too defined

# Hero Gradient Pattern Rule

Hero sections use a "full-bleed" gradient pattern where colorful orbs extend edge-to-edge across the viewport, creating an immersive background. The text content stays properly padded within a max-width container.

## The Pattern (ASCII)

```
CORRECT - Full-bleed gradient (edge-to-edge):
┌─────────────────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  TEXT STAYS PADDED  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────────────────────────────────────┘

WRONG - Centered with white margins:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  white    ┌─────────────────────────────────────────────────────┐   white   │
│  gaps     │   gradient background with content                  │   gaps    │
│           └─────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Required Structure

The gradient orbs MUST be at the section level (full viewport width), with content inside a max-width container:

```tsx
{/* CORRECT - Full-bleed gradient with padded content */}
<section className="relative overflow-hidden py-12 md:py-16">
  {/* Full-bleed gradient orbs - positioned relative to viewport edges */}
  <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-{color}-100 to-{shade}-100 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-{accent}-100 to-{shade}-100 blur-2xl" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-{color}-50/60 via-white/40 to-{accent}-50/60 blur-3xl" />

  {/* Content container - padded text stays readable */}
  <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
    <div className="flex items-center justify-center min-h-[180px]">
      <div className="text-center">
        {/* Page content here */}
      </div>
    </div>
  </div>
</section>
```

## What NOT To Do

```tsx
{/* WRONG - Orbs inside max-w container (creates white margins) */}
<section className="py-8 md:py-12">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
    <div className="relative overflow-hidden rounded-2xl">
      {/* These orbs are constrained to the max-w container! */}
      <div className="absolute -top-32 -right-32 ..." />
      <div className="absolute -bottom-20 -left-20 ..." />
      {/* Content */}
    </div>
  </div>
</section>
```

## Critical Rules

| Rule | Correct | Wrong |
|------|---------|-------|
| Container | Orbs at section level | Orbs inside `max-w-6xl` |
| Overflow | `overflow-hidden` on section | `overflow-hidden` on inner div |
| Section class | `relative overflow-hidden py-12` | `py-8` with inner overflow div |
| Center fill | Add centered gradient orb | No center fill |
| Content wrapper | `relative z-10 max-w-6xl` | Content in same div as orbs |
| Rounded corners | None (full-bleed) | `rounded-2xl` (boxed) |

## Three-Orb Pattern

For consistent full-bleed heroes, use three gradient orbs:

1. **Top-right orb** (primary color): `-top-32 -right-32 w-96 h-96 blur-3xl`
2. **Bottom-left orb** (accent color): `-bottom-20 -left-20 w-64 h-64 blur-2xl`
3. **Center fill** (blended): `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-3xl`

The center fill orb uses both colors with transparency to create smooth blending.

## Color Themes by Page

| Page | Theme | Primary Colors |
|------|-------|----------------|
| Homepage | Blue/Purple | `blue-100`, `purple-100`, `green-100` |
| Services | Purple/Teal | `purple-100`, `teal-100`, `cyan-100` |
| Pricing | Purple/Blue | `purple-100`, `blue-100` |
| FAQ | Amber/Purple | `amber-100`, `purple-100` |
| How It Works | Amber/Green | `amber-100`, `green-100` |
| Get Started | Amber/Green | `amber-100`, `green-100` |
| Blog | Purple/Amber | `purple-100`, `amber-100` |
| Legal pages | Slate/Blue | `slate-200`, `blue-100` |

## Why This Works

By placing gradient orbs at the section level with `relative overflow-hidden`, the gradients extend to the viewport edges on all screen sizes. The `overflow-hidden` clips the orbs at the viewport boundary while allowing the negative positioning to create soft edges that fade into the page background.

The content stays readable because it's inside a separate `max-w-6xl mx-auto` container with `relative z-10` to stay above the gradients.

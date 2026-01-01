# Dark Mode System

A reliable system that prevents dark mode bugs.

## The Problem

We keep having dark mode issues because:
1. Multiple color systems (`accentColors`, `solidButtonColors`, hardcoded classes)
2. No clear rules about when colors should invert vs stay the same
3. Low-opacity backgrounds (`/20`, `/30`, `/50`) become invisible in dark mode
4. Easy to add broken patterns without noticing

## The Solution: Three Principles

### Principle 1: All Colors From colors.ts

**Rule**: Never write `dark:` directly in components. Always use colors.ts.

```tsx
// BAD - hardcoded dark mode
<div className="bg-orange-100 dark:bg-gray-800">

// GOOD - from colors.ts
<div className={sectionColors.cta.bg}>
```

If you need a new color combination, ADD IT TO colors.ts first.

### Principle 2: No Opacity in Dark Mode

**Rule**: Never use `/20`, `/30`, `/50` etc. in dark mode classes.

```tsx
// BAD - 20% opacity is invisible on dark backgrounds
dark:bg-orange-900/20

// GOOD - solid colors only
dark:bg-gray-800
```

Why: Low opacity on dark backgrounds = nearly invisible. Solid colors = reliable.

### Principle 3: Two Patterns Only

**Pattern A: INVERSION** (buttons, cards, interactive elements)
- Light mode: light background + dark text
- Dark mode: dark background + light text

```typescript
// In colors.ts
cta: {
  bg: 'bg-orange-100 dark:bg-[#ad5700]',
  text: 'text-orange-900 dark:text-white',
}
```

**Pattern B: NEUTRAL** (page sections, containers)
- Light mode: white/light gray
- Dark mode: dark gray (gray-800, gray-900)

```typescript
section: {
  bg: 'bg-white dark:bg-gray-900',
  card: 'bg-gray-100 dark:bg-gray-800',
}
```

## Implementation

### Step 1: Consolidate colors.ts

Remove duplicate systems. One export per use case:

```typescript
// BUTTONS - use inversion pattern
export const buttonColors = {
  primary: { ... },   // orange with inversion
  secondary: { ... }, // blue with inversion
  danger: { ... },    // red with inversion
}

// SECTIONS - use neutral pattern
export const sectionColors = {
  default: { bg: 'bg-white dark:bg-gray-900' },
  elevated: { bg: 'bg-gray-100 dark:bg-gray-800' },
  accent: { bg: 'bg-orange-100 dark:bg-gray-800' },
}

// TEXT - automatic contrast
export const textColors = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-500 dark:text-gray-500',
}
```

### Step 2: Migrate Components

1. Search for `dark:` in components
2. Replace with colors.ts imports
3. If color doesn't exist, add it to colors.ts first

### Step 3: Add Lint Rule (Future)

ESLint rule that flags `dark:` classes outside of colors.ts.

## Quick Reference

| Element | Pattern | Example |
|---------|---------|---------|
| Buttons | Inversion | `buttonColors.primary` |
| Cards | Neutral | `sectionColors.elevated` |
| Page backgrounds | Neutral | `sectionColors.default` |
| Text | Contrast | `textColors.primary` |
| Borders | Match bg | Include in same object |

## Checklist Before Shipping

- [ ] No hardcoded `dark:` classes in new code
- [ ] No `/20`, `/30`, `/50` opacity in dark mode
- [ ] All new colors added to colors.ts
- [ ] Tested in both light and dark mode

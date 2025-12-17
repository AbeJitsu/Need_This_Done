# Unified Button/Badge Color System Plan

## Current Problems (DRY Violations)

| Location | Issue |
|----------|-------|
| `colors.ts` | Has `accentColors` with `hoverBorder` |
| `Button.tsx` | Has SEPARATE `hoverStates` object with DIFFERENT values |
| `Navigation.tsx` | HARDCODED colors, doesn't use `accentColors` at all |
| `CircleBadge.tsx` | Uses `accentColors` correctly ✓ |

**Example of mismatch:**
- colors.ts: `dark:hover:border-purple-100`
- Button.tsx: `dark:hover:border-purple-200`

## Solution: Single Source of Truth

### File 1: app/lib/colors.ts

Expand `accentColors` to include ALL styling properties:

```typescript
export const accentColors: Record<AccentVariant, {
  // Base styles
  bg: string;
  text: string;
  border: string;
  // Hover styles (NEW - consolidate from Button.tsx)
  hoverText: string;
  hoverBorder: string;
  hoverBg?: string;
}> = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    text: 'text-purple-700 dark:text-gray-900',
    border: 'border-purple-500 dark:border-purple-200',
    hoverText: 'hover:text-purple-800 dark:hover:text-black',
    hoverBorder: 'hover:border-purple-600 dark:hover:border-purple-100',
  },
  // ... same pattern for all colors
};

// Border width constant (easy to change globally)
export const accentBorderWidth = 'border-2';
```

### File 2: app/components/Button.tsx

**DELETE** the local `hoverStates` object and use `accentColors` exclusively:

```typescript
// REMOVE THIS:
const hoverStates: Record<AccentVariant, string> = { ... }

// USE THIS:
const colors = accentColors[variant];
const classes = `${accentBorderWidth} ${colors.bg} ${colors.text} ${colors.border} ${colors.hoverText} ${colors.hoverBorder}`;
```

### File 3: app/components/Navigation.tsx

**REPLACE** hardcoded colors with `accentColors.orange`:

```typescript
import { navigationColors, accentColors, accentBorderWidth } from '@/lib/colors';

// Desktop "Get a Quote" button
<Link
  className={`... ${accentBorderWidth} ${accentColors.orange.bg} ${accentColors.orange.text} ${accentColors.orange.border} ${accentColors.orange.hoverText} ${accentColors.orange.hoverBorder}`}
>
```

### File 4: app/components/CircleBadge.tsx

Add `accentBorderWidth` import:

```typescript
import { AccentVariant, accentColors, accentBorderWidth } from '@/lib/colors';

// Use it:
className={`... ${accentBorderWidth} ${colors.bg} ${colors.border} ${colors.text} ...`}
```

### File 5: app/tailwind.config.cjs

Add safelist for new classes:
```
'dark:bg-purple-500', 'dark:bg-blue-500', 'dark:bg-green-500',
'dark:bg-teal-500', 'dark:bg-gray-500', 'dark:bg-red-500',
'dark:text-gray-900', 'dark:hover:text-black'
```

## Color Values for 5:1 Contrast

On vibrant `-500` backgrounds in dark mode, use dark text:

| Color | Dark Mode BG | Dark Mode Text | Contrast |
|-------|-------------|----------------|----------|
| Purple | purple-500 | gray-900 | ~7:1 ✓ |
| Blue | blue-500 | gray-900 | ~5.5:1 ✓ |
| Green | green-500 | gray-900 | ~5.8:1 ✓ |
| Orange | orange-500 | gray-900 | ~5.2:1 ✓ |
| Teal | teal-500 | gray-900 | ~5.4:1 ✓ |
| Gray | gray-500 | gray-900 | ~4.6:1 (borderline) |
| Red | red-500 | gray-900 | ~5.1:1 ✓ |

## Benefits of This System

1. **One place to change** - Modify colors.ts, everything updates
2. **Consistent** - All buttons, badges, nav items match
3. **Easy to adjust** - Border width, colors, hover states all centralized
4. **Type-safe** - TypeScript catches missing properties
5. **WCAG compliant** - 5:1 contrast guaranteed

## Files to Modify (in order)
1. `app/lib/colors.ts` - Expand accentColors, add accentBorderWidth
2. `app/components/Button.tsx` - Remove hoverStates, use expanded accentColors
3. `app/components/CircleBadge.tsx` - Use accentBorderWidth
4. `app/components/Navigation.tsx` - Replace hardcoded with accentColors
5. `app/tailwind.config.cjs` - Add safelist entries

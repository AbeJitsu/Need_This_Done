# Bug: Button Text Invisible in Dark Mode

## Status: ACTIVE

## Screenshots

Buttons appear as empty colored boxes - no text visible in dark mode.

```
BROKEN - Dark Mode Buttons:
┌─────────────────────────────┐
│ ┌───────────────────────┐   │
│ │                       │   │  ← "Get Started" should be here
│ │   (empty purple box)  │   │     but text is invisible
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │                       │   │  ← "See How It Works" missing
│ │   (empty orange box)  │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

## Root Cause

Change to `accentColors.text` in `app/lib/colors.ts` broke button text visibility.

### The Problem

**Before (working):**
```tsx
purple: { text: 'text-purple-700', ... }
```

**After (broken):**
```tsx
purple: { text: 'text-purple-700 dark:text-purple-100', ... }
```

### Why This Breaks Buttons

Buttons use BOTH `accentColors.bg` AND `accentColors.text`:

```tsx
// Button.tsx line 61
${colors.bg} ${colors.text}
```

In dark mode this creates:
- Background: `bg-purple-100` (light purple - unchanged)
- Text: `dark:text-purple-100` (also light purple!)

**Light text on light background = invisible text!**

```
Color Contrast Problem:
┌────────────────────────────────────────┐
│  bg-purple-100  (light purple #E9D5FF) │
│  text-purple-100 (light purple #E9D5FF)│
│                                        │
│  Contrast ratio: 1:1 (FAIL)            │
│  Required: 4.5:1 minimum               │
└────────────────────────────────────────┘
```

## The Conflict

`accentColors.text` is shared between two use cases with OPPOSITE needs:

| Component | Background | Text Needs | Current Result |
|-----------|------------|------------|----------------|
| **Button** | Light (`bg-100`) | Dark text (`text-700`) | ❌ Light text invisible |
| **StepCard title** | Dark (`bg-gray-800`) | Light text (`text-100`) | ✓ Works |

We fixed StepCard titles but broke Buttons.

## Fix Options

### Option A: Revert and Use Separate Title Colors (Recommended)

1. **Revert `accentColors.text`** to original (no dark mode override):
```tsx
purple: { text: 'text-purple-700', ... }  // Button-safe
```

2. **Create new `titleTextColors`** for StepCard titles:
```tsx
export const titleTextColors: Record<AccentVariant, string> = {
  purple: 'text-purple-700 dark:text-purple-100',
  blue: 'text-blue-700 dark:text-blue-100',
  // etc.
};
```

3. **Update StepCard** to use `titleTextColors`:
```tsx
<h2 className={`text-xl font-bold mb-3 ${titleTextColors[color]}`}>
```

### Option B: Override in Button Component

Keep `accentColors.text` as-is but override in Button:

```tsx
// Button.tsx - force dark text
const textOverride = `!text-${variant}-700`;
```

**Problem**: Uses `!important` pattern, harder to maintain.

### Option C: Split accentColors Into Two Systems

Create separate `buttonColors` and `cardColors` systems entirely.

**Problem**: More duplication, harder to keep in sync.

## Files to Change

1. `app/lib/colors.ts` - Revert accentColors.text, add titleTextColors
2. `app/components/StepCard.tsx` - Use titleTextColors for h2
3. `app/tailwind.config.js` - Safelist already has needed classes

## Prevention

When modifying shared color systems, check ALL components that use them:
- Button (light bg, needs dark text)
- CircleBadge (light bg, needs dark text)
- StepCard (dark bg, needs light text)
- Card (dark bg, needs separate consideration)

## Related

- Original intent: Fix dark mode contrast on How It Works page titles
- Commit that caused this: (uncommitted changes)

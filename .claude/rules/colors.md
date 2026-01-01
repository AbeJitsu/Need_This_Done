# Color System Rule

**NEVER hardcode colors.** All colors come from `lib/colors.ts`.

## The Anchor System (WCAG AA)

Every color scale has two mathematically-defined anchor points:

| Shade | Contrast With | Purpose |
|-------|---------------|---------|
| **-500** | 4.5:1 with white | Dark mode backgrounds |
| **-600** | 4.5:1 with -100 | Light mode minimum accessible text |

This makes the system **predictable**:
- In dark mode: use -500 background + white text
- In light mode: use -100 background + -600 to -900 text

## Light Mode vs Dark Mode

```
┌─────────────────────────────────────────────────────────────────┐
│  LIGHT MODE              │  DARK MODE                          │
├─────────────────────────────────────────────────────────────────┤
│  Background: -100        │  Background: -500                   │
│  Text: -600 to -900      │  Text: white                        │
│  Border: -500            │  Border: -400                       │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```typescript
import { formInputColors, accentColors } from '@/lib/colors';

<p className={formInputColors.helper}>Helper text</p>
```

## Puck Components

For Puck visual builder components, use utilities from `lib/puck-utils.tsx`:

```typescript
import { getPuckAccentColors, getPuckFullColors } from '@/lib/puck-utils';

const colors = getPuckAccentColors(accentColor);
const fullColors = getPuckFullColors(accentColor);
```

## Why This Matters

- Dynamic Tailwind classes break in production (purged at build time)
- Centralized colors enable theme changes
- Consistent brand across all components
- WCAG AA compliance is built into the scale (500 difference = 4.5:1)

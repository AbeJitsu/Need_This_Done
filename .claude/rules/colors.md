# Color System Rule

**NEVER hardcode colors.** All colors come from `lib/colors.ts`.

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
- WCAG AA compliance built into the color scale

## Note

Dark mode is currently disabled. Light mode only.

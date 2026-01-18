# Color System Rule

**NEVER hardcode colors.** All colors come from `lib/colors.ts`.

## BJJ Belt Color Progression

The founder is a Brazilian Jiu-Jitsu purple belt. Use the BJJ belt progression as the primary color hierarchy:

| Order | Color | Tailwind Palette | Usage |
|-------|-------|------------------|-------|
| 1st | **Green** | `emerald-*` | Primary actions, success states, main CTAs |
| 2nd | **Blue** | `blue-*` | Secondary elements, links, professional tone |
| 3rd | **Purple** | `purple-*` | Tertiary accents, creativity, special emphasis |
| 4th | **Gold** | `gold-*` | Warm highlights, links on dark backgrounds |

**Important**: Avoid orange/amber for text. Use gold instead for warm accents.

## Contrast Compliance (WCAG AA)

Minimum compliant shades on white backgrounds:

| Color | Min Text (4.5:1) | Min Border (3:1) |
|-------|------------------|------------------|
| Emerald | emerald-600 | emerald-500 |
| Blue | blue-600 | blue-500 |
| Purple | purple-600 | purple-500 |
| Gold | gold-700 | gold-500 |
| Gray | gray-600 | gray-400 |
| Stone | stone-600 | stone-500 |
| Slate | slate-600 | slate-400 |
| Red | red-600 | red-500 |

**Warning:** `stone-400` (2.52:1) does NOT meet 3:1 contrast. Use `stone-500` minimum.

**Reference:** See `app/color-contrast-viewer.html` for full palette with ratios.

When multiple colored elements appear together (buttons, headings, sections), follow this progression top-to-bottom or left-to-right.

## Usage

```typescript
import { formInputColors, accentColors, titleColors } from '@/lib/colors';

// For text colors
<h2 className={titleColors.green}>Primary Heading</h2>
<h3 className={titleColors.blue}>Secondary Heading</h3>
<h4 className={titleColors.purple}>Tertiary Heading</h4>

// For helper text
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

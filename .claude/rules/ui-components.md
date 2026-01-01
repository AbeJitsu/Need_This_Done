# UI Components Rule

Use established components. Don't reinvent them with hardcoded styles.

## Required Components

| Need | Use | Not |
|------|-----|-----|
| Button/CTA | `<Button variant="gold">` | `<Link className="bg-gold-500...">` |
| Button link | `<Button href="/path">` | `<a className="px-6 py-2 rounded...">` |

## Button Component

Location: `@/components/Button`

```tsx
import Button from '@/components/Button';

// Available variants: blue, gold, purple, green, teal, gray, red
<Button variant="gold" href="/get-started" size="lg">
  Start a Project
</Button>

// As a button (not link)
<Button variant="blue" onClick={handleClick}>
  Submit
</Button>
```

## Why This Matters

- Dark mode compliance is built into the component
- Consistent hover/focus states
- One place to update styling site-wide
- Accessibility (focus rings, disabled states) handled

## Red Flags

If you see yourself writing any of these, stop and use Button instead:
- `className="bg-gold-500 text-white"`
- `className="px-6 py-2 rounded-lg font-semibold"`
- `className="hover:bg-gold-600 transition-colors"`
- Any button-like styling on `<Link>` or `<a>` tags

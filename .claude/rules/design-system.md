# Design System

Design standards, accessibility requirements, and component guidelines.

## Color System

**Location:** `app/lib/colors.ts`

All colors are centralized. Import from `@/lib/colors`:
- `accentColors` - Primary action colors
- `titleColors` - Typography emphasis
- `gradients` - Background gradients

**Rule:** Extend the existing palette, don't replace it.

## Accessibility Standards (WCAG AA)

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components | 3:1 |

We target **5:1 minimum** for all text.

**Verify with:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Component Patterns

### Existing Components

Check `app/components/` before building new ones:
- **Layout:** Card, PageHeader, CTASection
- **Content:** ServiceCard, PricingCard, StepCard, FeatureCard
- **UI:** Button, CircleBadge

### Building New Components

1. Check for similar existing components
2. Import colors from `@/lib/colors`
3. Add `.a11y.test.tsx` file if interactive
4. Consider adding a Storybook story

## Running Tests

```bash
npm run test:a11y     # Accessibility tests only
npm run test:run      # All tests
```

## Note

Dark mode is currently disabled. Light mode only.

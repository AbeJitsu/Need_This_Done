# Design System

Single source of truth for design standards, accessibility requirements, and component guidelines.

## Color System

**Location:** `app/lib/colors.ts`

All colors are centralized in one file. Import from `@/lib/colors` for consistency:
- `accentColors` - Primary action colors
- `titleColors` - Typography emphasis
- `gradients` - Background gradients

**Rule:** Extend the existing palette, don't replace it.

## Accessibility Standards (WCAG AA)

### Contrast Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components | 3:1 |

We target **5:1 minimum** for all text to exceed AA standards.

**Verify with:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Dark Mode

Every component must work in both light and dark themes:

```jsx
// Always pair light and dark variants
<p className="text-gray-900 dark:text-gray-100">Text</p>
<div className="bg-white dark:bg-gray-800">Container</div>
```

### Motion

Respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
}
```

## Component Testing

### Accessibility Tests

New components require `.a11y.test.tsx` files:

```typescript
// app/__tests__/components/MyComponent.a11y.test.tsx
import { testBothModes, hasContrastViolations } from '@/__tests__/setup/a11y-utils';

it('has no contrast issues in both modes', async () => {
  const { container } = render(<MyComponent />);
  const results = await testBothModes(container, 'MyComponent');

  expect(hasContrastViolations(results.light)).toBe(false);
  expect(hasContrastViolations(results.dark)).toBe(false);
});
```

### Test Utilities

**Location:** `app/__tests__/setup/a11y-utils.ts`

- `testBothModes()` - Tests light and dark modes
- `testLightModeAccessibility()` - Light mode only
- `testDarkModeAccessibility()` - Dark mode only
- `hasContrastViolations()` - Checks contrast specifically

### Running Tests

```bash
npm run test:a11y     # Accessibility tests only
npm run test:run      # All tests
```

## Component Patterns

### Existing Components

Check `app/components/` before building new ones:
- **Layout:** Card, PageHeader, CTASection
- **Content:** ServiceCard, PricingCard, StepCard, FeatureCard
- **UI:** Button, CircleBadge

### Building New Components

1. Check for similar existing components
2. Import colors from `@/lib/colors`
3. Support light and dark modes
4. Add `.a11y.test.tsx` file
5. Consider adding a Storybook story

## Related Documentation

- [Dark Mode Testing Guide](dark-mode-testing.md) - Detailed testing workflows and common fixes
- [Brand Identity](../.claude/DESIGN_BRIEF.md) - Visual style, personality, creative direction

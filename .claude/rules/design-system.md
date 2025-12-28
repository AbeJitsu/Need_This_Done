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

### Dark Mode Requirements

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

### Running Accessibility Tests

```bash
npm run test:a11y     # Accessibility tests only
npm run test:run      # All tests (includes accessibility)
```

## Dark Mode Testing Guide

### Automated Testing

Accessibility tests run automatically when you:
```bash
npm run test:run          # Run all tests
npm run test:a11y         # Run only accessibility tests
npm run test              # Run tests in watch mode
```

### What Gets Tested

✅ **Color contrast** - Text must be readable on all backgrounds
✅ **Light mode** - Components tested with normal (light) theme
✅ **Dark mode** - Components tested with `dark` class applied
✅ **Form inputs** - Labels are properly associated
✅ **Keyboard navigation** - All interactive elements are keyboard accessible
✅ **Semantic HTML** - Proper use of headings, buttons, and labels

### Testing Locally

To visually test dark mode in your browser:

1. **In the app:** Toggle dark mode with the theme switcher (top right)
2. **In dev tools:** Add `dark` class to `<html>` element and refresh
3. **Run accessibility tests:**
   ```bash
   npm run test:run -- --grep "dark mode"
   ```

### Visual Testing Checklist

When visually testing dark mode:
- [ ] Text is clearly readable
- [ ] Buttons have enough contrast
- [ ] Form inputs are visible
- [ ] Interactive elements are distinct
- [ ] No "hidden" text that blends with background

### Common Dark Mode Issues & Fixes

#### Issue: Text disappears in dark mode

**Cause:** Text color doesn't have dark mode variant

**Fix:**
```jsx
// ❌ Wrong
<p className="text-gray-800">Text</p>

// ✅ Right
<p className="text-gray-900 dark:text-gray-100">Text</p>
```

#### Issue: Low contrast button

**Cause:** Background and text don't have enough contrast

**Fix:**
```jsx
// ❌ Wrong
<button className="bg-gray-700 text-gray-600">Button</button>

// ✅ Right
<button className="bg-gray-700 dark:bg-gray-600 text-white dark:text-gray-100">Button</button>
```

#### Issue: Container background too similar to text

**Cause:** Semi-transparent backgrounds in dark mode

**Fix:**
```jsx
// ❌ Wrong
<div className="dark:bg-blue-900/20">
  <p className="dark:text-gray-100">Text</p>
</div>

// ✅ Right
<div className="dark:bg-gray-700">
  <p className="dark:text-gray-100">Text</p>
</div>
```

### Testing Dynamic & Conditional Content

Components that render content based on state or user interactions can hide contrast issues:

```typescript
// This only shows when data is loaded
{isLoading ? <p>Loading...</p> : <div className="dark:bg-blue-900/20">...</div>}
```

Simple tests that render the component and immediately test it will miss violations in hidden content.

**Solution: Test All States**

1. **Test initial/empty state:**
```typescript
it('should have no contrast issues in collapsed state', async () => {
  const { container } = render(<MyComponent />);
  const results = await testBothModes(container, 'MyComponent empty');
  expect(hasContrastViolations(results.dark)).toBe(false);
});
```

2. **Test expanded/populated states:**
```typescript
it('should have contrast when data is loaded', async () => {
  const { container, getByRole } = render(<MyComponent />);

  // Trigger the state change that reveals content
  const button = getByRole('button');
  fireEvent.click(button);

  // Wait for content to appear
  await waitFor(() => {
    expect(container.textContent).toContain('Expected text');
  });

  // Now test for contrast issues
  const results = await testBothModes(container, 'MyComponent expanded');
  expect(hasContrastViolations(results.dark)).toBe(false);
});
```

3. **Common content triggers to test:**
- Click handlers that reveal sections
- API calls that populate lists
- Expandable accordions or details
- Form submissions that show results
- State changes that switch views

### Writing New Dark Mode Tests

When you create a new component with dark mode support:

1. **Add a test file:** `__tests__/components/MyComponent.a11y.test.tsx`
2. **Test both modes:**
   ```typescript
   import { testBothModes } from '@/__tests__/setup/a11y-utils';

   it('should have no contrast issues in both modes', async () => {
     const { container } = render(<MyComponent />);
     const results = await testBothModes(container, 'MyComponent');

     expect(hasContrastViolations(results.light)).toBe(false);
     expect(hasContrastViolations(results.dark)).toBe(false);
   });
   ```

### Running Tests in CI/CD

The tests will automatically run as part of your quality checks:

```bash
npm run test:run  # This fails if accessibility tests fail
```

This ensures dark mode issues are caught before deployment.

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
5. Test both light and dark modes
6. Consider adding a Storybook story

## Tools & Resources

- **Jest-Axe:** Testing library for accessibility
- **Axe Core:** Accessibility testing engine
- **Tailwind Dark Mode:** We use `dark:` classes for dark mode
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

## Related Documentation

- [Brand Identity](../.claude/DESIGN_BRIEF.md) - Visual style, personality, creative direction

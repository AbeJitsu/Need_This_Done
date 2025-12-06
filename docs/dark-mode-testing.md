# Dark Mode Testing Guide

## Overview

This project includes automated accessibility testing to catch dark mode contrast issues before they reach production. All components are tested for WCAG AA contrast compliance in both light and dark modes.

## How It Works

### Automated Testing

**Accessibility tests run automatically when you:**
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

### The Test Setup

**Utilities:** `app/__tests__/setup/a11y-utils.ts`
- `testBothModes()` - Tests a component in light and dark modes
- `testLightModeAccessibility()` - Tests light mode only
- `testDarkModeAccessibility()` - Tests dark mode only
- `hasContrastViolations()` - Checks specifically for contrast issues

**Test Files:**
- `app/__tests__/components/DatabaseDemo.a11y.test.tsx` - Database component tests
- `app/__tests__/components/AuthDemo.a11y.test.tsx` - Auth component tests

## Testing Locally

### Quick Test in Dark Mode

To visually test dark mode in your browser:

1. **In the app:** Toggle dark mode with the theme switcher (top right)
2. **In dev tools:** Add `dark` class to `<html>` element and refresh
3. **Run accessibility tests:**
   ```bash
   npm run test:run -- --grep "dark mode"
   ```

### What to Look For

When visually testing dark mode:
- [ ] Text is clearly readable
- [ ] Buttons have enough contrast
- [ ] Form inputs are visible
- [ ] Interactive elements are distinct
- [ ] No "hidden" text that blends with background

## Common Dark Mode Issues & Fixes

### Issue: Text disappears in dark mode
**Cause:** Text color doesn't have dark mode variant
**Fix:**
```jsx
// ❌ Wrong
<p className="text-gray-800">Text</p>

// ✅ Right
<p className="text-gray-900 dark:text-gray-100">Text</p>
```

### Issue: Low contrast button
**Cause:** Background and text don't have enough contrast
**Fix:**
```jsx
// ❌ Wrong
<button className="bg-gray-700 text-gray-600">Button</button>

// ✅ Right
<button className="bg-gray-700 dark:bg-gray-600 text-white dark:text-gray-100">Button</button>
```

### Issue: Container background too similar to text
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

## Testing Dynamic & Conditional Content

### The Challenge

Components that render content based on state or user interactions can hide contrast issues:

```typescript
// This only shows when data is loaded
{isLoading ? <p>Loading...</p> : <div className="dark:bg-blue-900/20">...</div>}
```

Simple tests that render the component and immediately test it will miss violations in hidden content.

### Solution: Test All States

**1. Test initial/empty state:**
```typescript
it('should have no contrast issues in collapsed state', async () => {
  const { container } = render(<MyComponent />);
  const results = await testBothModes(container, 'MyComponent empty');
  expect(hasContrastViolations(results.dark)).toBe(false);
});
```

**2. Test expanded/populated states:**
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

**3. Common content triggers to test:**
- Click handlers that reveal sections
- API calls that populate lists
- Expandable accordions or details
- Form submissions that show results
- State changes that switch views

### Example: DatabaseDemo Flow Trace

The DatabaseDemo component shows a "What Just Happened" section only after data is saved. The test:
1. Renders the component
2. Enters text and saves (triggering the API call)
3. Waits for the flow trace to appear
4. Tests both light and dark modes for contrast

```typescript
it('should have contrast in flow trace when data is present', async () => {
  const { container, getByRole, getByPlaceholderText } = render(<DatabaseDemo />);

  // Populate data
  const input = getByPlaceholderText(/type something/i);
  fireEvent.change(input, { target: { value: 'test' } });
  fireEvent.click(getByRole('button', { name: /save/i }));

  // Wait for flow trace
  await waitFor(() => expect(container.textContent).toContain('What Just Happened'));

  // Test both modes
  const results = await testBothModes(container, 'DatabaseDemo with flow trace');
  expect(hasContrastViolations(results.dark)).toBe(false);
});
```

## Writing New Tests

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

## WCAG AA Standards

This project targets **WCAG AA** compliance, which requires:
- Normal text: **4.5:1 contrast ratio** (minimum)
- Large text (18pt+): **3:1 contrast ratio** (minimum)
- UI components: **3:1 contrast ratio** (minimum)

## Running Tests in CI/CD

The tests will automatically run as part of your quality checks:

```bash
npm run test:run  # This fails if accessibility tests fail
```

This ensures dark mode issues are caught before deployment.

## Tools & Resources

- **Jest-Axe:** Testing library for accessibility
- **Axe Core:** Accessibility testing engine
- **Tailwind Dark Mode:** We use `dark:` classes for dark mode
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

## Questions?

If you encounter dark mode contrast issues:
1. Check the test output for specific violations
2. Use the contrast checker tool above
3. Ensure both `text-{color}` and `dark:text-{color}` are specified
4. Verify background has both light and dark variants

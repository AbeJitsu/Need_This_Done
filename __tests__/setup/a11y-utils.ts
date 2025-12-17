// ============================================================================
// Accessibility Testing Utilities
// ============================================================================
// Helpers for testing contrast and accessibility in light and dark modes
// Ensures components remain readable in both themes

import { axe, toHaveNoViolations } from 'jest-axe';
import type { AxeResults } from 'axe-core';

export async function checkAccessibility(
  container: HTMLElement,
  options?: any
): Promise<AxeResults> {
  return axe(container, options);
}

// Test a component in light mode
export async function testLightModeAccessibility(
  container: HTMLElement
): Promise<AxeResults> {
  // Ensure light mode classes are applied
  container.classList.remove('dark');
  return checkAccessibility(container);
}

// Test a component in dark mode
export async function testDarkModeAccessibility(
  container: HTMLElement
): Promise<AxeResults> {
  // Apply dark mode classes
  container.classList.add('dark');
  // Also apply to html element to match real app behavior
  document.documentElement.classList.add('dark');

  const results = await checkAccessibility(container);

  // Clean up
  document.documentElement.classList.remove('dark');

  return results;
}

// Test both light and dark modes
export async function testBothModes(
  container: HTMLElement,
  testName: string
): Promise<{ light: AxeResults; dark: AxeResults }> {
  const light = await testLightModeAccessibility(container);
  const dark = await testDarkModeAccessibility(container);

  // Report any violations
  if (light.violations.length > 0) {
    console.warn(
      `\n⚠️ Light mode accessibility issues in ${testName}:`,
      light.violations
    );
  }

  if (dark.violations.length > 0) {
    console.warn(
      `\n⚠️ Dark mode accessibility issues in ${testName}:`,
      dark.violations
    );
  }

  return { light, dark };
}

// Helper to check contrast specifically
export function hasContrastViolations(results: AxeResults): boolean {
  return results.violations.some((v) => v.id === 'color-contrast');
}

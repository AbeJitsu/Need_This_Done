// ============================================================================
// TechnicalFlow Accessibility Tests
// ============================================================================
// Ensures technical flow component maintains accessibility in both light and dark modes
// Tests all states: collapsed, expanded, and dynamically rendered content

import { render, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import TechnicalFlow from '@/components/TechnicalFlow';
import { testBothModes, hasContrastViolations } from '@/__tests__/setup/a11y-utils';

describe('TechnicalFlow Accessibility', () => {
  it('should have no accessibility violations in light mode (collapsed state)', async () => {
    const { container } = render(<TechnicalFlow />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in dark mode (collapsed state)', async () => {
    const { container } = render(<TechnicalFlow />);
    document.documentElement.classList.add('dark');

    const results = await axe(container);

    document.documentElement.classList.remove('dark');
    expect(results).toHaveNoViolations();
  });

  it('should have sufficient contrast in both light and dark modes', async () => {
    const { container } = render(<TechnicalFlow />);

    const results = await testBothModes(container, 'TechnicalFlow');

    expect(hasContrastViolations(results.light)).toBe(false);
    expect(hasContrastViolations(results.dark)).toBe(false);
  });

  it('should maintain accessibility when steps are expanded', async () => {
    const { container, getAllByRole } = render(<TechnicalFlow />);

    // Expand first step
    const stepButtons = getAllByRole('button');
    fireEvent.click(stepButtons[0]);

    // Wait for expansion animation
    await waitFor(() => {
      expect(container.textContent).toContain('Code Example');
    });

    // Test expanded state in both modes
    const results = await testBothModes(container, 'TechnicalFlow expanded');
    expect(hasContrastViolations(results.light)).toBe(false);
    expect(hasContrastViolations(results.dark)).toBe(false);
  });

  it('should have no contrast violations in performance explanation section', async () => {
    const { container } = render(<TechnicalFlow />);

    // The performance explanation section should have proper contrast
    const results = await testBothModes(container, 'TechnicalFlow performance section');

    expect(hasContrastViolations(results.light)).toBe(false);
    expect(hasContrastViolations(results.dark)).toBe(false);
  });
});

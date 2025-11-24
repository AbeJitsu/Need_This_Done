// ============================================================================
// DatabaseDemo Accessibility Tests
// ============================================================================
// Ensures contrast and readability in both light and dark modes

import { render, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import DatabaseDemo from '@/components/DatabaseDemo';
import { testBothModes, hasContrastViolations } from '@/__tests__/setup/a11y-utils';

describe('DatabaseDemo Accessibility', () => {
  it('should have no accessibility violations in light mode', async () => {
    const { container } = render(<DatabaseDemo />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in dark mode', async () => {
    const { container } = render(<DatabaseDemo />);
    document.documentElement.classList.add('dark');

    const results = await axe(container);

    document.documentElement.classList.remove('dark');
    expect(results).toHaveNoViolations();
  });

  it('should have sufficient contrast in both light and dark modes', async () => {
    const { container } = render(<DatabaseDemo />);

    const results = await testBothModes(container, 'DatabaseDemo');

    expect(hasContrastViolations(results.light)).toBe(false);
    expect(hasContrastViolations(results.dark)).toBe(false);
  });

  it('should be keyboard navigable', async () => {
    const { getByRole } = render(<DatabaseDemo />);

    const saveButton = getByRole('button', { name: /save/i });
    expect(saveButton).toBeVisible();
    expect(saveButton).toHaveClass('focus:ring-2');
  });

  it('should have sufficient contrast in flow trace when data is present', async () => {
    const { container, getByRole, getByPlaceholderText } = render(<DatabaseDemo />);

    // Populate the component by entering text and saving
    const input = getByPlaceholderText(/type something/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test data' } });

    const saveButton = getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Wait for flow trace to appear
    await waitFor(
      () => {
        expect(container.textContent).toContain('What Just Happened');
      },
      { timeout: 2000 }
    );

    // Test both modes with populated flow trace
    const results = await testBothModes(container, 'DatabaseDemo with flow trace');

    expect(hasContrastViolations(results.light)).toBe(false);
    expect(hasContrastViolations(results.dark)).toBe(false);
  });
});

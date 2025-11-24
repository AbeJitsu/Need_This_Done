// ============================================================================
// DatabaseDemo Accessibility Tests
// ============================================================================
// Ensures contrast and readability in both light and dark modes

import { render } from '@testing-library/react';
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
});

// ============================================================================
// AuthDemo Accessibility Tests
// ============================================================================
// Ensures authentication demo maintains accessibility in both light and dark modes
// Focuses on form inputs, labels, and color contrast

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import AuthDemo from '@/components/AuthDemo';
import { AuthProvider } from '@/context/AuthContext';
import { testBothModes, hasContrastViolations } from '@/__tests__/setup/a11y-utils';

// Helper to render AuthDemo with AuthProvider context
const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('AuthDemo Accessibility', () => {
  it('should have no accessibility violations in light mode', async () => {
    const { container } = renderWithAuth(<AuthDemo />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in dark mode', async () => {
    const { container } = renderWithAuth(<AuthDemo />);
    document.documentElement.classList.add('dark');

    const results = await axe(container);

    document.documentElement.classList.remove('dark');
    expect(results).toHaveNoViolations();
  });

  it('should have sufficient contrast in both light and dark modes', async () => {
    const { container } = renderWithAuth(<AuthDemo />);

    const results = await testBothModes(container, 'AuthDemo');

    expect(hasContrastViolations(results.light)).toBe(false);
    expect(hasContrastViolations(results.dark)).toBe(false);
  });

});

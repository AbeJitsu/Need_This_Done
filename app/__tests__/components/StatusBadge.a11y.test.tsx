import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StatusBadge from '@/components/StatusBadge';

expect.extend(toHaveNoViolations);

// ============================================================================
// StatusBadge Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the status badge component.
// Verifies semantic meaning is conveyed to screen readers.

describe('StatusBadge accessibility', () => {
  const statuses = ['submitted', 'in_review', 'scheduled', 'in_progress', 'completed'] as const;

  describe('axe compliance', () => {
    statuses.forEach((status) => {
      it(`has no accessibility violations for ${status} status`, async () => {
        const { container } = render(<StatusBadge status={status} />);
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe('semantic meaning', () => {
    it('has role="status" for semantic meaning', () => {
      const { getByRole } = render(<StatusBadge status="in_progress" />);
      expect(getByRole('status')).toBeInTheDocument();
    });

    it('displays correct label text', () => {
      const { getByRole } = render(<StatusBadge status="completed" />);
      expect(getByRole('status')).toHaveTextContent('Completed');
    });
  });

  describe('sizes', () => {
    it('has no accessibility violations at small size', async () => {
      const { container } = render(<StatusBadge status="submitted" size="sm" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations at medium size', async () => {
      const { container } = render(<StatusBadge status="submitted" size="md" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

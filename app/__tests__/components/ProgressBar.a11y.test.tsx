import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProgressBar from '@/components/ProgressBar';

expect.extend(toHaveNoViolations);

// ============================================================================
// ProgressBar Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the progress bar component.
// Verifies aria attributes and screen reader announcements.

describe('ProgressBar accessibility', () => {
  describe('axe compliance', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ProgressBar value={50} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations with label', async () => {
      const { container } = render(<ProgressBar value={75} label="Course Progress" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations when complete', async () => {
      const { container } = render(<ProgressBar value={100} label="Done" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('ARIA attributes', () => {
    it('has progressbar role', () => {
      const { getByRole } = render(<ProgressBar value={50} />);
      expect(getByRole('progressbar')).toBeInTheDocument();
    });

    it('has aria-valuenow matching value', () => {
      const { getByRole } = render(<ProgressBar value={75} />);
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('has aria-valuemin of 0', () => {
      const { getByRole } = render(<ProgressBar value={50} />);
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    });

    it('has aria-valuemax of 100', () => {
      const { getByRole } = render(<ProgressBar value={50} />);
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    });

    it('has aria-label', () => {
      const { getByRole } = render(<ProgressBar value={50} label="Course Progress" />);
      expect(getByRole('progressbar')).toHaveAttribute('aria-label', 'Course Progress');
    });

    it('has aria-valuetext for better screen reader experience', () => {
      const { getByRole } = render(<ProgressBar value={75} />);
      const progressbar = getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuetext');
      // Should include percentage in human readable form
      expect(progressbar.getAttribute('aria-valuetext')).toMatch(/75.*%|complete/i);
    });

    it('has meaningful aria-valuetext when complete', () => {
      const { getByRole } = render(<ProgressBar value={100} />);
      const progressbar = getByRole('progressbar');
      expect(progressbar.getAttribute('aria-valuetext')).toMatch(/complete/i);
    });
  });

  describe('sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`has no accessibility violations at ${size} size`, async () => {
        const { container } = render(<ProgressBar value={50} size={size} />);
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });
});

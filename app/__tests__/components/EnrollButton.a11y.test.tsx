import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import EnrollButton from '@/components/EnrollButton';

expect.extend(toHaveNoViolations);

// ============================================================================
// EnrollButton Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the enrollment button component.
// Tests free enrollment, paid enrollment, and enrolled states.

describe('EnrollButton accessibility', () => {
  const defaultProps = {
    courseId: 'course-123',
    courseName: 'Test Course',
  };

  describe('free enrollment button', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<EnrollButton {...defaultProps} price={0} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has correct aria-label for free course', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} price={0} />);
      expect(getByTestId('enroll-button')).toHaveAttribute(
        'aria-label',
        'Enroll in Test Course for free'
      );
    });

    it('displays "Enroll Free" text', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} price={0} />);
      expect(getByTestId('enroll-button')).toHaveTextContent('Enroll Free');
    });
  });

  describe('paid enrollment button', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<EnrollButton {...defaultProps} price={2999} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has correct aria-label for paid course', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} price={2999} />);
      expect(getByTestId('enroll-button')).toHaveAttribute(
        'aria-label',
        'Purchase Test Course for $29.99'
      );
    });

    it('displays price in button', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} price={2999} />);
      expect(getByTestId('enroll-button')).toHaveTextContent('$29.99');
    });
  });

  describe('enrolled state', () => {
    it('has no accessibility violations when enrolled', async () => {
      const { container } = render(
        <EnrollButton {...defaultProps} isEnrolled={true} />
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('is disabled when enrolled', () => {
      const { getByTestId } = render(
        <EnrollButton {...defaultProps} isEnrolled={true} />
      );
      expect(getByTestId('enroll-button')).toBeDisabled();
    });

    it('has descriptive aria-label when enrolled', () => {
      const { getByTestId } = render(
        <EnrollButton {...defaultProps} isEnrolled={true} />
      );
      expect(getByTestId('enroll-button')).toHaveAttribute(
        'aria-label',
        'Already enrolled in Test Course'
      );
    });

    it('displays "Enrolled" text with checkmark', () => {
      const { getByTestId } = render(
        <EnrollButton {...defaultProps} isEnrolled={true} />
      );
      expect(getByTestId('enroll-button')).toHaveTextContent('Enrolled');
    });
  });

  describe('color variants', () => {
    const colors = ['blue', 'green', 'purple'] as const;

    colors.forEach((color) => {
      it(`has no accessibility violations with ${color} color`, async () => {
        const { container } = render(
          <EnrollButton {...defaultProps} color={color} />
        );
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe('sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`has no accessibility violations at ${size} size`, async () => {
        const { container } = render(
          <EnrollButton {...defaultProps} size={size} />
        );
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe('fullWidth option', () => {
    it('has no accessibility violations with fullWidth', async () => {
      const { container } = render(
        <EnrollButton {...defaultProps} fullWidth />
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('focus management', () => {
    it('button can receive focus', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} />);
      const button = getByTestId('enroll-button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('button element', () => {
    it('is a button element', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} />);
      expect(getByTestId('enroll-button').tagName).toBe('BUTTON');
    });

    it('has data-testid for testing', () => {
      const { getByTestId } = render(<EnrollButton {...defaultProps} />);
      expect(getByTestId('enroll-button')).toBeInTheDocument();
    });
  });
});

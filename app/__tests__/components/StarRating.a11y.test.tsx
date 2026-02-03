import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StarRating from '@/components/StarRating';

expect.extend(toHaveNoViolations);

// ============================================================================
// StarRating Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the star rating component.
// Tests both readonly (display) and interactive (input) modes.

describe('StarRating accessibility', () => {
  describe('readonly mode', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<StarRating value={3} readonly />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has img role when readonly', () => {
      const { getByRole } = render(<StarRating value={4} readonly />);
      const ratingContainer = getByRole('img');
      expect(ratingContainer).toHaveAttribute(
        'aria-label',
        'Rating: 4 out of 5 stars'
      );
    });

    it('has correct aria-label for different values', () => {
      const { getByRole, rerender } = render(<StarRating value={1} readonly />);
      expect(getByRole('img')).toHaveAttribute(
        'aria-label',
        'Rating: 1 out of 5 stars'
      );

      rerender(<StarRating value={5} readonly />);
      expect(getByRole('img')).toHaveAttribute(
        'aria-label',
        'Rating: 5 out of 5 stars'
      );
    });

    it('star buttons have tabIndex -1 in readonly mode', () => {
      const { getAllByRole } = render(<StarRating value={3} readonly />);
      const buttons = getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('interactive mode', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has radiogroup role when interactive', () => {
      const { getByRole } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      expect(getByRole('radiogroup')).toBeInTheDocument();
    });

    it('star buttons have radio role in interactive mode', () => {
      const { getAllByRole } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      const radios = getAllByRole('radio');
      expect(radios).toHaveLength(5);
    });

    it('has aria-checked on selected star', () => {
      const { getAllByRole } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      const radios = getAllByRole('radio');
      expect(radios[2]).toHaveAttribute('aria-checked', 'true');
      expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    });

    it('each star has descriptive aria-label', () => {
      const { getAllByRole } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      const radios = getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-label', '1 star');
      expect(radios[1]).toHaveAttribute('aria-label', '2 stars');
      expect(radios[4]).toHaveAttribute('aria-label', '5 stars');
    });

    it('buttons are focusable in interactive mode', () => {
      const { getAllByRole } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      const buttons = getAllByRole('radio');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('star buttons have focus-visible styles for keyboard users', () => {
      const { getAllByRole } = render(
        <StarRating value={3} onChange={mockOnChange} />
      );
      const buttons = getAllByRole('radio');

      // At least one button should have focus-visible styling
      // We check that focus-visible: classes are present (not just focus:)
      const firstButton = buttons[0];
      expect(firstButton.className).toMatch(/focus-visible:/);
    });
  });

  describe('with showValue', () => {
    it('has no accessibility violations when showing value', async () => {
      const { container } = render(<StarRating value={4.5} showValue readonly />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('different sizes', () => {
    it('has no accessibility violations at small size', async () => {
      const { container } = render(<StarRating value={3} size="sm" readonly />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations at large size', async () => {
      const { container } = render(<StarRating value={3} size="lg" readonly />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

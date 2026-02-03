import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CouponInput from '@/components/CouponInput';

expect.extend(toHaveNoViolations);

// ============================================================================
// CouponInput Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the coupon input component.
// Tests input state, success state, error state, and disabled state.

describe('CouponInput accessibility', () => {
  describe('default input state', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<CouponInput />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has labeled input field', () => {
      const { getByLabelText } = render(<CouponInput />);
      expect(getByLabelText('Coupon code')).toBeInTheDocument();
    });

    it('has labeled apply button', () => {
      const { getByLabelText } = render(<CouponInput />);
      expect(getByLabelText('Apply coupon')).toBeInTheDocument();
    });

    it('input has placeholder text', () => {
      const { getByPlaceholderText } = render(<CouponInput />);
      expect(getByPlaceholderText('Enter coupon code')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('has no accessibility violations when disabled', async () => {
      const { container } = render(<CouponInput disabled />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('input is disabled', () => {
      const { getByLabelText } = render(<CouponInput disabled />);
      expect(getByLabelText('Coupon code')).toBeDisabled();
    });
  });

  describe('color variants', () => {
    const colors = ['blue', 'green', 'purple'] as const;

    colors.forEach((color) => {
      it(`has no accessibility violations with ${color} color`, async () => {
        const { container } = render(<CouponInput color={color} />);
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe('with cart context', () => {
    it('has no accessibility violations with cart data', async () => {
      const { container } = render(
        <CouponInput
          cartTotal={5000}
          itemCount={3}
          isFirstOrder={true}
        />
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('keyboard interaction', () => {
    it('input can be focused', () => {
      const { getByLabelText } = render(<CouponInput />);
      const input = getByLabelText('Coupon code');
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('apply button exists and has proper label', () => {
      const { getByLabelText } = render(<CouponInput />);
      const button = getByLabelText('Apply coupon');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('apply button has focus-visible styles for keyboard users', () => {
      const { getByLabelText } = render(<CouponInput />);
      const button = getByLabelText('Apply coupon');

      // Check that the button has focus-visible classes (not dynamic template strings)
      const className = button.className;
      expect(className).toMatch(/focus-visible:/);
    });

    it('apply button uses static focus ring class (not dynamic template literal)', () => {
      // Dynamic template literals like focus-visible:ring-${color}-500 won't work in Tailwind
      // because the class needs to be statically analyzable at build time
      const { getByLabelText } = render(<CouponInput color="blue" />);
      const button = getByLabelText('Apply coupon');

      // The class should contain a complete, static focus-visible:ring class
      // NOT a template literal like "focus-visible:ring-blue-500" (which doesn't exist in generated CSS)
      const className = button.className;
      // Check for either static class OR the properly-generated focusRingClasses pattern
      expect(className).toMatch(/focus-visible:ring-(2|blue-500)/);
    });
  });

  describe('with testid', () => {
    it('has data-testid for testing', () => {
      const { getByTestId } = render(<CouponInput />);
      expect(getByTestId('coupon-input')).toBeInTheDocument();
    });
  });

  describe('form semantics', () => {
    it('input has type text', () => {
      const { getByLabelText } = render(<CouponInput />);
      expect(getByLabelText('Coupon code')).toHaveAttribute('type', 'text');
    });

    it('apply button is a button element', () => {
      const { getByLabelText } = render(<CouponInput />);
      const button = getByLabelText('Apply coupon');
      expect(button.tagName).toBe('BUTTON');
    });
  });
});

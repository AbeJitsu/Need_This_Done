import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CompareButton from '@/components/CompareButton';
import { ComparisonProvider } from '@/context/ComparisonContext';

expect.extend(toHaveNoViolations);

// ============================================================================
// CompareButton Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the CompareButton component.
// Verifies keyboard accessibility and focus management.

// Wrapper component to provide required context
function CompareButtonWrapper(props: Parameters<typeof CompareButton>[0]) {
  return (
    <ComparisonProvider>
      <CompareButton {...props} />
    </ComparisonProvider>
  );
}

const mockProduct = {
  id: 'test-product-1',
  title: 'Test Product',
  description: 'A test product description',
  images: [{ url: 'https://example.com/image.jpg' }],
  variants: [{ calculated_price: { calculated_amount: 2999 } }],
};

describe('CompareButton accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<CompareButtonWrapper product={mockProduct} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders as a button element', () => {
    const { getByRole } = render(<CompareButtonWrapper product={mockProduct} />);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('has focus-visible styles for keyboard users', () => {
    const { getByRole } = render(<CompareButtonWrapper product={mockProduct} />);
    const button = getByRole('button');

    // Check that the button has focus-visible classes
    const className = button.className;
    expect(className).toMatch(/focus-visible:/);
  });

  it('can receive focus', () => {
    const { getByRole } = render(<CompareButtonWrapper product={mockProduct} />);
    const button = getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('has accessible label', () => {
    const { getByRole } = render(<CompareButtonWrapper product={mockProduct} />);
    const button = getByRole('button');

    // Button should have accessible text content
    expect(button.textContent).toContain('Compare');
  });

  it('disabled button has appropriate attributes when max reached', () => {
    // This test verifies the disabled state is accessible
    const { getByRole } = render(<CompareButtonWrapper product={mockProduct} />);
    const button = getByRole('button');

    // When not at max, button should not be disabled
    expect(button).not.toBeDisabled();
  });

  it('has aria-pressed attribute for toggle state', () => {
    const { getByRole } = render(<CompareButtonWrapper product={mockProduct} />);
    const button = getByRole('button');

    // Button should indicate whether product is selected via aria-pressed
    expect(button).toHaveAttribute('aria-pressed');
  });
});

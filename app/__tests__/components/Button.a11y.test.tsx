import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '@/components/Button';

expect.extend(toHaveNoViolations);

// ============================================================================
// Button Accessibility Tests
// ============================================================================
// Tests WCAG AA compliance for the Button component.
// Tests all variants, sizes, and states (disabled, loading, link mode).

describe('Button accessibility', () => {
  describe('basic button', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders as a button element', () => {
      const { getByRole } = render(<Button>Click me</Button>);
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('has accessible text content', () => {
      const { getByRole } = render(<Button>Submit Form</Button>);
      expect(getByRole('button')).toHaveTextContent('Submit Form');
    });
  });

  describe('as link', () => {
    it('has no accessibility violations when rendered as link', async () => {
      const { container } = render(<Button href="/page">Go to page</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders as a link when href is provided', () => {
      const { getByRole } = render(<Button href="/about">About</Button>);
      expect(getByRole('link')).toBeInTheDocument();
      expect(getByRole('link')).toHaveAttribute('href', '/about');
    });
  });

  describe('disabled state', () => {
    it('has no accessibility violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has disabled attribute when disabled', () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);
      expect(getByRole('button')).toBeDisabled();
    });
  });

  describe('loading state', () => {
    it('has no accessibility violations when loading', async () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has aria-busy when loading', () => {
      const { getByRole } = render(<Button isLoading>Submit</Button>);
      expect(getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('shows loading text when provided', () => {
      const { getByRole } = render(
        <Button isLoading loadingText="Submitting...">
          Submit
        </Button>
      );
      expect(getByRole('button')).toHaveTextContent('Submitting...');
    });

    it('is disabled when loading', () => {
      const { getByRole } = render(<Button isLoading>Submit</Button>);
      expect(getByRole('button')).toBeDisabled();
    });
  });

  describe('color variants', () => {
    const variants = ['blue', 'green', 'purple', 'gold', 'teal', 'gray', 'red'] as const;

    variants.forEach((variant) => {
      it(`has no accessibility violations with ${variant} variant`, async () => {
        const { container } = render(<Button variant={variant}>Button</Button>);
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe('sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`has no accessibility violations at ${size} size`, async () => {
        const { container } = render(<Button size={size}>Button</Button>);
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe('button types', () => {
    it('defaults to type button', () => {
      const { getByRole } = render(<Button>Click</Button>);
      expect(getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('can be type submit', () => {
      const { getByRole } = render(<Button type="submit">Submit</Button>);
      expect(getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('focus management', () => {
    it('can receive focus', () => {
      const { getByRole } = render(<Button>Focusable</Button>);
      const button = getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('disabled button cannot receive focus via click', () => {
      const onClick = vi.fn();
      const { getByRole } = render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      );
      const button = getByRole('button');
      button.click();
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

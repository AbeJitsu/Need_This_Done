import { render, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ScenarioCard from '@/components/Wizard/ScenarioCard';

expect.extend(toHaveNoViolations);

// ============================================================================
// ScenarioCard Accessibility Tests
// ============================================================================
// Validates WCAG AA compliance for the wizard scenario selection cards.
// Covers: axe audits, ARIA attributes, keyboard focus, and CSS class checks.

// Framer Motion renders standard HTML in jsdom (no actual animation),
// so motion.button becomes a regular <button> we can test against.

const defaultProps = {
  icon: '🚀',
  title: 'Launch a new site',
  description: 'Get your business online fast',
  selected: false,
  onClick: vi.fn(),
};

describe('ScenarioCard accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('axe audit', () => {
    it('has no violations when unselected', async () => {
      const { container } = render(<ScenarioCard {...defaultProps} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when selected', async () => {
      const { container } = render(<ScenarioCard {...defaultProps} selected />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('button semantics', () => {
    it('renders as a button element', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} />);
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('has type="button" to prevent form submission', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} />);
      expect(getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('aria-pressed state', () => {
    it('is false when unselected', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} />);
      expect(getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('is true when selected', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} selected />);
      expect(getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('content rendering', () => {
    it('displays the title', () => {
      const { getByText } = render(<ScenarioCard {...defaultProps} />);
      expect(getByText('Launch a new site')).toBeInTheDocument();
    });

    it('displays the description', () => {
      const { getByText } = render(<ScenarioCard {...defaultProps} />);
      expect(getByText('Get your business online fast')).toBeInTheDocument();
    });

    it('hides the icon from screen readers', () => {
      const { container } = render(<ScenarioCard {...defaultProps} />);
      const iconSpan = container.querySelector('span[aria-hidden="true"]');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toHaveTextContent('🚀');
    });
  });

  describe('interaction', () => {
    it('fires onClick when clicked', () => {
      const onClick = vi.fn();
      const { getByRole } = render(<ScenarioCard {...defaultProps} onClick={onClick} />);
      fireEvent.click(getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('can receive focus', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} />);
      const button = getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('CSS classes', () => {
    it('uses "transition" not "transition-colors" for shadow animation', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} />);
      const button = getByRole('button');
      const classNames = button.className.split(/\s+/);
      // Must have bare 'transition' (which includes box-shadow)
      expect(classNames).toContain('transition');
      // Must NOT have 'transition-colors' (which excludes box-shadow)
      expect(classNames).not.toContain('transition-colors');
    });

    it('has emerald border when selected', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} selected />);
      expect(getByRole('button').className).toContain('border-emerald-500');
    });

    it('has gray border when not selected', () => {
      const { getByRole } = render(<ScenarioCard {...defaultProps} />);
      expect(getByRole('button').className).toContain('border-gray-200');
    });
  });
});

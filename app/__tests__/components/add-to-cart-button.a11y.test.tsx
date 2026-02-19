import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';

// ============================================================================
// AddToCartButton Unit Tests
// ============================================================================
// What: Tests the AddToCartButton component logic
// Why: Ensures cart integration works correctly — right args passed,
//      success state shows and resets, double-click prevention works.
// How: Mocks CartContext.useCart, renders component, simulates clicks.

// Mock the CartContext
const mockAddItem = vi.fn();
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ShoppingCart: () => 'ShoppingCart',
  Check: () => 'Check',
}));

import AddToCartButton from '@/components/pricing/AddToCartButton';

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('calls addItem with correct arguments when clicked', () => {
    const { getByRole } = render(
      <AddToCartButton
        variantId="variant_123"
        title="Growth Site"
        price={150000}
      />
    );

    fireEvent.click(getByRole('button'));

    expect(mockAddItem).toHaveBeenCalledWith('variant_123', 1, {
      title: 'Growth Site',
      unit_price: 150000,
      thumbnail: undefined,
    });
  });

  it('passes thumbnail when provided', () => {
    const { getByRole } = render(
      <AddToCartButton
        variantId="variant_456"
        title="Starter Site"
        price={50000}
        thumbnail="https://example.com/image.jpg"
      />
    );

    fireEvent.click(getByRole('button'));

    expect(mockAddItem).toHaveBeenCalledWith('variant_456', 1, {
      title: 'Starter Site',
      unit_price: 50000,
      thumbnail: 'https://example.com/image.jpg',
    });
  });

  it('shows success state after click and resets after 1.5s', () => {
    const { getByRole } = render(
      <AddToCartButton
        variantId="variant_123"
        title="Growth Site"
        price={150000}
      />
    );

    // Initial state: shows "Add to Cart"
    expect(getByRole('button').textContent).toContain('Add to Cart');

    // Click
    fireEvent.click(getByRole('button'));

    // Should show "Added"
    expect(getByRole('button').textContent).toContain('Added');

    // After 1.5s, should reset
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(getByRole('button').textContent).toContain('Add to Cart');
  });

  it('prevents double-click during success animation', () => {
    const { getByRole } = render(
      <AddToCartButton
        variantId="variant_123"
        title="Growth Site"
        price={150000}
      />
    );

    // First click
    fireEvent.click(getByRole('button'));
    expect(mockAddItem).toHaveBeenCalledTimes(1);

    // Second click during success state — should be ignored
    fireEvent.click(getByRole('button'));
    expect(mockAddItem).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label for accessibility', () => {
    const { getByRole } = render(
      <AddToCartButton
        variantId="variant_123"
        title="Pro Site"
        price={500000}
      />
    );

    // Before click
    expect(getByRole('button').getAttribute('aria-label')).toBe(
      'Add Pro Site to cart'
    );

    // After click
    fireEvent.click(getByRole('button'));
    expect(getByRole('button').getAttribute('aria-label')).toBe(
      'Pro Site added to cart'
    );
  });
});

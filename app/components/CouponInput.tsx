'use client';

import { useState, useCallback } from 'react';
import { formInputColors, accentColors, alertColors } from '@/lib/colors';

// ============================================================================
// CouponInput Component
// ============================================================================
// What: Input field for entering and validating coupon codes
// Why: Allows customers to apply discounts at checkout
// How: Validates code via API, displays result, reports discount to parent

type AccentColor = 'blue' | 'green' | 'purple';

// Focus ring classes must be static for Tailwind to include them in the build
const focusRingClasses: Record<AccentColor, string> = {
  blue: 'focus-visible:ring-blue-500',
  green: 'focus-visible:ring-green-500',
  purple: 'focus-visible:ring-purple-500',
};

interface CouponResult {
  valid: boolean;
  coupon_id?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  message?: string;
  error?: string;
}

export interface CouponInputProps {
  cartTotal?: number;
  itemCount?: number;
  isFirstOrder?: boolean;
  onApply?: (result: CouponResult) => void;
  onRemove?: () => void;
  color?: AccentColor;
  disabled?: boolean;
}

export default function CouponInput({
  cartTotal = 0,
  itemCount = 0,
  isFirstOrder = false,
  onApply,
  onRemove,
  color = 'blue',
  disabled = false,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CouponResult | null>(null);
  const colors = accentColors[color];

  const validateCoupon = useCallback(async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams({
        code: code.trim(),
        cart_total: String(cartTotal),
        item_count: String(itemCount),
        first_order: String(isFirstOrder),
      });

      const response = await fetch(`/api/coupons?${params}`);
      const data = await response.json();

      setResult(data);

      if (data.valid) {
        onApply?.(data);
      }
    } catch (error) {
      setResult({
        valid: false,
        error: 'Failed to validate coupon',
      });
    } finally {
      setIsLoading(false);
    }
  }, [code, cartTotal, itemCount, isFirstOrder, isLoading, onApply]);

  const handleRemove = useCallback(() => {
    setCode('');
    setResult(null);
    onRemove?.();
  }, [onRemove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateCoupon();
    }
  }, [validateCoupon]);

  // If coupon is applied, show success state
  if (result?.valid) {
    return (
      <div
        className={`rounded-lg border ${alertColors.success.border} ${alertColors.success.bg} p-4`}
        data-testid="coupon-input"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 ${alertColors.success.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className={`font-medium ${alertColors.success.text}`}>
                {code.toUpperCase()}
              </p>
              <p className={`text-sm ${alertColors.success.text} opacity-80`}>
                {result.message}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className={`text-sm font-medium ${alertColors.success.text} hover:opacity-70`}
            aria-label="Remove coupon"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="coupon-input">
      {/* Input Row */}
      <div className="flex gap-2">
        <div className="flex-grow relative">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter coupon code"
            disabled={disabled || isLoading}
            autoComplete="off"
            className={`
              w-full px-4 py-2.5 rounded-lg
              ${formInputColors.base}
              ${formInputColors.placeholder}
              ${formInputColors.focus}
              disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-300
              uppercase tracking-wider transition-colors
            `}
            aria-label="Coupon code"
            aria-describedby={result?.error ? 'coupon-error' : undefined}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
        </div>
        <button
          onClick={validateCoupon}
          disabled={!code.trim() || disabled || isLoading}
          className={`
            px-6 py-2.5 rounded-lg font-medium
            ${colors.bg} ${colors.text}
            motion-safe:hover:scale-105 motion-safe:active:scale-95 transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${focusRingClasses[color]}
            disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
            disabled:after:absolute disabled:after:inset-0 disabled:after:bg-black/20 disabled:after:rounded-lg
            relative
          `}
          aria-label="Apply coupon"
        >
          Apply
        </button>
      </div>

      {/* Error Message */}
      {result?.error && (
        <div
          id="coupon-error"
          className={`mt-2 flex items-center gap-2 text-sm ${alertColors.error.text}`}
          role="alert"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {result.error}
        </div>
      )}
    </div>
  );
}

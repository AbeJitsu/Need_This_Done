'use client';

import { useState, useCallback } from 'react';
import { accentColors } from '@/lib/colors';

// ============================================================================
// StarRating Component
// ============================================================================
// What: Display or input star ratings (1-5)
// Why: Visual representation of product quality ratings
// How: Shows filled/empty stars, optionally allows interaction

type AccentColor = 'blue' | 'green' | 'purple';
type RatingSize = 'sm' | 'md' | 'lg';

export interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  showValue?: boolean;
  size?: RatingSize;
  color?: AccentColor;
  className?: string;
}

const sizeClasses: Record<RatingSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const textSizes: Record<RatingSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  showValue = false,
  size = 'md',
  color = 'blue',
  className = '',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const colors = accentColors[color];
  const isInteractive = !readonly && !!onChange;

  const handleClick = useCallback((rating: number) => {
    if (isInteractive) {
      onChange?.(rating);
    }
  }, [isInteractive, onChange]);

  const handleMouseEnter = useCallback((rating: number) => {
    if (isInteractive) {
      setHoverValue(rating);
    }
  }, [isInteractive]);

  const handleMouseLeave = useCallback(() => {
    if (isInteractive) {
      setHoverValue(null);
    }
  }, [isInteractive]);

  const displayValue = hoverValue ?? value;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value} out of 5 stars`}
      data-testid="star-rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        const isHalf = star - 0.5 === displayValue;

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${sizeClasses[size]}
              ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-transform
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded
              disabled:cursor-default
            `}
            role={isInteractive ? 'radio' : undefined}
            aria-checked={isInteractive ? star === value : undefined}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            tabIndex={readonly ? -1 : 0}
          >
            <svg
              className={`
                ${sizeClasses[size]}
                ${isFilled || isHalf ? colors.text : 'text-gray-300 dark:text-gray-600'}
              `}
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isHalf ? (
                // Half star (using gradient)
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${star})`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isFilled ? 0 : 1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              )}
            </svg>
          </button>
        );
      })}

      {showValue && (
        <span className={`ml-1 font-medium text-gray-900 dark:text-gray-100 ${textSizes[size]}`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

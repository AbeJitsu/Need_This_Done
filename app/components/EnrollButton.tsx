'use client';

import { useState } from 'react';
import { accentColors } from '@/lib/colors';

// ============================================================================
// EnrollButton Component
// ============================================================================
// What: Button for enrolling in courses (free or paid)
// Why: Provides consistent enrollment UI across the LMS
// How: Handles enrollment state, loading, and redirects to checkout for paid

type AccentColor = 'blue' | 'green' | 'purple';

export interface EnrollButtonProps {
  courseId: string;
  courseName: string;
  price?: number;
  isEnrolled?: boolean;
  onEnrollSuccess?: () => void;
  onEnrollError?: (error: string) => void;
  color?: AccentColor;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function EnrollButton({
  courseId,
  courseName,
  price = 0,
  isEnrolled = false,
  onEnrollSuccess,
  onEnrollError,
  color = 'blue',
  size = 'md',
  fullWidth = false,
}: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  const isFree = price === 0;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Get color classes from our color system
  const colors = accentColors[color];

  // Ring colors for focus state (not in accentColors)
  const ringColors = {
    blue: 'focus:ring-blue-500',
    green: 'focus:ring-green-500',
    purple: 'focus:ring-purple-500',
  };

  const handleEnroll = async () => {
    if (enrolled || isLoading) return;

    setIsLoading(true);

    try {
      if (isFree) {
        // Free enrollment - call API directly
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            enrollment_type: 'free',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to enroll');
        }

        setEnrolled(true);
        onEnrollSuccess?.();
      } else {
        // Paid enrollment - redirect to checkout
        window.location.href = `/checkout?course=${courseId}&name=${encodeURIComponent(courseName)}`;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll';
      onEnrollError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Already enrolled state
  if (enrolled) {
    return (
      <button
        disabled
        className={`
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          inline-flex items-center justify-center gap-2
          rounded-lg font-medium
          bg-gray-100 text-gray-500 cursor-not-allowed
          dark:bg-gray-800 dark:text-gray-400
        `}
        data-testid="enroll-button"
        aria-label={`Already enrolled in ${courseName}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Enrolled
      </button>
    );
  }

  // Format price for display
  const formatPrice = (cents: number) => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-all duration-200
        ${colors.bg} ${colors.text}
        hover:opacity-90
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${ringColors[color]}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      data-testid="enroll-button"
      aria-label={
        isLoading
          ? 'Enrolling...'
          : isFree
            ? `Enroll in ${courseName} for free`
            : `Purchase ${courseName} for ${formatPrice(price)}`
      }
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin w-5 h-5"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Enrolling...
        </>
      ) : isFree ? (
        'Enroll Free'
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {formatPrice(price)}
        </>
      )}
    </button>
  );
}

// ============================================================================
// Loading Spinner Component - Centralized loading indicator
// ============================================================================
// Reusable spinner for buttons, cards, and any loading state.
// Matches the accent color system from colors.ts.

import { AccentVariant } from '@/lib/colors';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: AccentVariant | 'white' | 'current';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const colorClasses: Record<string, string> = {
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  gold: 'text-gold-600 dark:text-gold-400',
  teal: 'text-teal-600 dark:text-teal-400',
  gray: 'text-gray-600 dark:text-gray-400',
  red: 'text-red-600 dark:text-red-400',
  white: 'text-white',
  current: 'text-current',
};

export default function LoadingSpinner({
  size = 'md',
  color = 'current',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
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
  );
}

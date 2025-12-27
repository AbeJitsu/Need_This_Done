// ============================================================================
// Field Error Component - Inline form validation feedback
// ============================================================================
// Displays error messages next to form fields for better UX.
// Use for field-level validation instead of showing all errors in one place.

import { formValidationColors } from '@/lib/colors';

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export default function FieldError({ message, className = '' }: FieldErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-1.5 mt-1.5 text-sm ${formValidationColors.error} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

// ============================================================================
// Field Success Component - Inline success feedback
// ============================================================================

interface FieldSuccessProps {
  message?: string;
  className?: string;
}

export function FieldSuccess({ message, className = '' }: FieldSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-1.5 mt-1.5 text-sm ${formValidationColors.success} ${className}`}
      role="status"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

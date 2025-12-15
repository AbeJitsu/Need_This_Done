'use client';

import { useEffect } from 'react';
import { alertColors, formValidationColors } from '@/lib/colors';

// ============================================================================
// Toast - Notification component
// ============================================================================
// What: Non-blocking notification that auto-dismisses
// Why: Better UX than alert() for API errors and success messages
// How: Appears in bottom-right, fades in/out, auto-dismisses after 3s

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

// Type-specific styles
const toastStyles: Record<ToastType, {
  bg: string;
  border: string;
  text: string;
  icon: JSX.Element;
}> = {
  success: {
    bg: alertColors.success.bg,
    border: alertColors.success.border,
    text: formValidationColors.success,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: alertColors.error.bg,
    border: alertColors.error.border,
    text: formValidationColors.error,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    bg: alertColors.info.bg,
    border: alertColors.info.border,
    text: formValidationColors.info,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const styles = toastStyles[type];

  // ========================================================================
  // Auto-dismiss after 3 seconds
  // ========================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        rounded-lg p-4 shadow-lg
        flex items-start gap-3
        animate-toast-enter
        max-w-sm
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`${styles.text} flex-shrink-0`}>
        {styles.icon}
      </div>

      {/* Message */}
      <p className={`${styles.text} text-sm flex-1`}>
        {message}
      </p>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className={`${styles.text} opacity-70 hover:opacity-100 transition-opacity flex-shrink-0`}
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-toast-enter {
          animation: toast-enter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

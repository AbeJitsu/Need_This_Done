'use client';

import { useEffect, useRef } from 'react';
import {
  cardBgColors,
  iconButtonColors,
  headingColors,
  formInputColors,
} from '@/lib/colors';

// ============================================================================
// ConfirmDialog - Reusable confirmation modal
// ============================================================================
// What: Professional confirmation dialog for destructive/important actions
// Why: Replaces unprofessional browser confirm() dialogs with branded UI
// How: Modal overlay with configurable message, buttons, and variants

type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
}

// Variant-specific button styles
const variantStyles: Record<ConfirmDialogVariant, {
  confirmBg: string;
  confirmHover: string;
  confirmText: string;
}> = {
  danger: {
    confirmBg: 'bg-red-600 dark:bg-red-500',
    confirmHover: 'hover:bg-red-700 dark:hover:bg-red-600',
    confirmText: 'text-white',
  },
  warning: {
    confirmBg: 'bg-amber-600 dark:bg-amber-500',
    confirmHover: 'hover:bg-amber-700 dark:hover:bg-amber-600',
    confirmText: 'text-white',
  },
  info: {
    confirmBg: 'bg-blue-600 dark:bg-blue-500',
    confirmHover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
    confirmText: 'text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
}: ConfirmDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant];

  // ========================================================================
  // Handle escape key to cancel
  // ========================================================================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // ========================================================================
  // Focus trap and scroll lock when modal is open
  // ========================================================================
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Focus modal
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render if closed
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal container - centered */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* Modal panel */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative w-full max-w-md
            ${cardBgColors.base} rounded-2xl shadow-2xl
            transition-all duration-300 ease-out
            animate-modal-enter
          `}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className={`
              absolute top-4 right-4 z-10
              ${iconButtonColors.text} ${iconButtonColors.hover}
              p-2 rounded-lg ${iconButtonColors.bg} transition-colors
            `}
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h2
              id="confirm-dialog-title"
              className={`text-xl font-bold ${headingColors.primary} mb-3 pr-8`}
            >
              {title}
            </h2>

            {/* Message */}
            <p
              id="confirm-dialog-message"
              className={`${formInputColors.helper} mb-6`}
            >
              {message}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Cancel button - secondary */}
              <button
                onClick={onCancel}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg font-medium
                  border-2 border-gray-300 dark:border-gray-600
                  ${headingColors.primary}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                `}
              >
                {cancelLabel}
              </button>

              {/* Confirm button - primary */}
              <button
                onClick={onConfirm}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg font-medium
                  ${styles.confirmBg} ${styles.confirmHover} ${styles.confirmText}
                  transition-colors
                `}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

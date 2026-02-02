'use client';

import { useRef, useEffect } from 'react';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  cardBgColors,
  iconButtonColors,
  headingColors,
  formInputColors,
  getSolidButtonColors,
} from '@/lib/colors';
import { CloseIcon } from '@/components/ui/icons';

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

// Variant-specific button styles - using centralized color utilities
const redBtn = getSolidButtonColors('red');
const blueBtn = getSolidButtonColors('blue');

const variantStyles: Record<ConfirmDialogVariant, {
  confirmBg: string;
  confirmHover: string;
  confirmText: string;
}> = {
  danger: {
    confirmBg: redBtn.bg,
    confirmHover: redBtn.hover,
    confirmText: redBtn.text,
  },
  warning: {
    confirmBg: 'bg-gold-600 dark:bg-gold-500',
    confirmHover: 'hover:bg-gold-700 dark:hover:bg-gold-600',
    confirmText: 'text-white',
  },
  info: {
    confirmBg: blueBtn.bg,
    confirmHover: blueBtn.hover,
    confirmText: blueBtn.text,
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
  const { handleBackdropClick, modalRef } = useBackdropClose({
    isOpen,
    onClose: onCancel,
    includeEscape: true,
  });
  const { containerRef: focusTrapRef } = useFocusTrap({
    isOpen,
    onClose: onCancel,
  });
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const styles = variantStyles[variant];

  // ========================================================================
  // Store previously focused element and restore focus on close
  // ========================================================================
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
    } else if (previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current.focus();
      previouslyFocusedElementRef.current = null;
    }
  }, [isOpen]);

  // Don't render if closed
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay - visual layer */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal container - centered, handles clicks outside modal */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* Modal panel - stops click propagation so outside clicks close modal */}
        <div
          ref={(el) => {
            if (el && modalRef && focusTrapRef) {
              (modalRef as any).current = el;
              (focusTrapRef as any).current = el;
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative w-full max-w-md
            ${cardBgColors.base} rounded-2xl shadow-2xl
            transition-all duration-300 ease-out
            motion-safe:animate-modal-enter
          `}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className={`
              absolute top-4 right-4 z-10
              ${iconButtonColors.text} ${iconButtonColors.hover}
              p-2 rounded-lg ${iconButtonColors.bg} transition-all duration-200
              motion-safe:hover:scale-110 motion-safe:active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
            `}
            aria-label="Close dialog"
          >
            <CloseIcon size="md" />
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
                  border-2 border-gray-400 dark:border-gray-600
                  ${headingColors.primary}
                  hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-500
                  motion-safe:hover:scale-105 motion-safe:active:scale-95
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                `}
              >
                {cancelLabel}
              </button>

              {/* Confirm button - primary */}
              <button
                onClick={onConfirm}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg font-medium border-2
                  ${styles.confirmBg} ${styles.confirmHover} ${styles.confirmText}
                  motion-safe:hover:scale-105 motion-safe:active:scale-95
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                  ${variant === 'danger' ? 'focus-visible:ring-red-500' : variant === 'warning' ? 'focus-visible:ring-gold-500' : 'focus-visible:ring-blue-500'}
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

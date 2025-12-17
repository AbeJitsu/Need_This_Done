'use client';

import { useEffect, useRef } from 'react';

// ============================================================================
// useBackdropClose Hook - Reusable Modal Click-Outside Handler
// ============================================================================
// What: Hook that closes modal when user clicks outside (backdrop)
// Why: Consistent, easy-to-configure click-outside behavior across all modals
// How: Provides handlers for backdrop onClick and Escape key

interface UseBackdropCloseOptions {
  isOpen: boolean;
  onClose: () => void;
  includeEscape?: boolean; // Whether to also handle Escape key (default: true)
}

export function useBackdropClose({
  isOpen,
  onClose,
  includeEscape = true,
}: UseBackdropCloseOptions) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // Handle backdrop click (click outside modal)
  // ========================================================================
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ========================================================================
  // Handle escape key
  // ========================================================================
  useEffect(() => {
    if (!isOpen || !includeEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, includeEscape]);

  return { handleBackdropClick, modalRef };
}

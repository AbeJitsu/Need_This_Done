'use client';

import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// useFocusTrap Hook - Keyboard Focus Management for Modals
// ============================================================================
// What: Hook that traps Tab focus within a modal and moves focus to first focusable element
// Why: Keyboard-only users can't escape modal, and initial focus management is poor
// How: Manages focus on mount/unmount, handles Tab key to cycle through focusable elements

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
}

export function useFocusTrap({ isOpen, onClose }: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // Get all focusable elements within the modal
  // ========================================================================
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        focusableSelectors.join(',')
      )
    ).filter((el) => {
      // Exclude hidden elements
      return el.offsetParent !== null;
    });
  }, []);

  // ========================================================================
  // Move focus to first focusable element when modal opens
  // ========================================================================
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Focus the first focusable element (or the modal itself as fallback)
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      containerRef.current.focus();
    }
  }, [isOpen, getFocusableElements]);

  // ========================================================================
  // Handle Tab key to cycle through focusable elements
  // ========================================================================
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const currentElement = document.activeElement as HTMLElement;
      const currentIndex = focusableElements.indexOf(currentElement);

      if (e.shiftKey) {
        // Shift+Tab: move focus backward
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex].focus();
      } else {
        // Tab: move focus forward
        const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex].focus();
      }

      e.preventDefault();
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    return () => containerRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, getFocusableElements]);

  return { containerRef };
}

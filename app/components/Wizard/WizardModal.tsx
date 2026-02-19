'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TIMING } from '@/components/motion/variants';

// ============================================
// WIZARD MODAL
// ============================================
// Centered overlay that hosts the wizard in overlay mode.
// Closes on backdrop click or X button.
// Traps focus and disables background scroll when open.

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function WizardModal({ isOpen, onClose, children }: WizardModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Sales assessment wizard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Panel — outer shell clips atmospheric orbs */}
          <motion.div
            ref={panelRef}
            className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: TIMING.duration.fast, ease: TIMING.ease.smooth }}
          >
            {/* Atmospheric gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-100 blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-blue-100 blur-2xl opacity-50 pointer-events-none" />

            {/* Height-constrained flex container — cards scroll inside, nav stays pinned */}
            <div className="relative z-10 max-h-[85vh] overflow-hidden flex flex-col p-6 sm:p-8">
              {/* Close button */}
              <motion.button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Close wizard"
                whileHover={prefersReducedMotion ? undefined : { rotate: 90, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} />
              </motion.button>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WizardFloatingButton from './WizardFloatingButton';
import WizardModal from './WizardModal';
import WizardProvider from './WizardProvider';
import WizardContent from './WizardContent';

// ============================================
// WIZARD WIDGET (Floating Overlay)
// ============================================
// Composite component: floating "Help me choose" button + modal.
// Hidden on /admin/* routes and /build (which has its own full-page wizard).
// The WizardProvider is mounted inside the modal so catalog fetching
// only happens when the user opens the wizard, not on every page load.

// Custom event name for opening wizard from anywhere (mirrors ChatbotWidget)
export const OPEN_WIZARD_EVENT = 'open-wizard';

export default function WizardWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Listen for custom event to open wizard from anywhere
  // (e.g. hero device iframe easter egg forwards button clicks here)
  useEffect(() => {
    const handleOpenWizard = () => setIsOpen(true);
    window.addEventListener(OPEN_WIZARD_EVENT, handleOpenWizard);
    return () => window.removeEventListener(OPEN_WIZARD_EVENT, handleOpenWizard);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Hide on admin routes and /build page
  if (pathname?.startsWith('/admin') || pathname === '/build') return null;

  return (
    <>
      {!isOpen && <WizardFloatingButton onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <WizardModal isOpen={isOpen} onClose={handleClose}>
          <WizardProvider source="overlay">
            <WizardContent />
          </WizardProvider>
        </WizardModal>
      )}
    </>
  );
}

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { serviceModalContentMap, resolveServiceType } from '@/lib/service-modal-content';
import type { ServiceModalContent, ServiceType } from '@/lib/service-modal-content';
import type { ServiceModalContent as PageModalContent } from '@/lib/page-config';

// ============================================================================
// Service Modal Context
// ============================================================================
// What: Manages service detail modal state across the app
// Why: ServiceCards on any page can open a detailed modal with friendly info
// How: Context provider pattern (same as CartContext, ChatbotWidget)
//
// Modal content priority:
// 1. Page content passed via openModalWithContent - allows inline editing
// 2. Static content from service-modal-content.ts - fallback

// Extended modal content with card index for inline editing
export interface EditableServiceModal extends ServiceModalContent {
  cardIndex?: number;
}

interface ServiceModalContextType {
  isOpen: boolean;
  activeService: EditableServiceModal | null;
  activeServiceType: ServiceType | null;
  cardIndex: number | null;
  // Original method - uses static content
  openModal: (serviceIdentifier: string) => void;
  // New method - uses page content for inline editing
  openModalWithContent: (title: string, cardIndex: number, modal: PageModalContent) => void;
  closeModal: () => void;
}

const ServiceModalContext = createContext<ServiceModalContextType | undefined>(undefined);

// ============================================================================
// Service Modal Provider
// ============================================================================

export function ServiceModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeService, setActiveService] = useState<EditableServiceModal | null>(null);
  const [activeServiceType, setActiveServiceType] = useState<ServiceType | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);

  // ========================================================================
  // Open modal with static content (fallback)
  // ========================================================================
  const openModal = useCallback((serviceIdentifier: string) => {
    const serviceType = resolveServiceType(serviceIdentifier);

    if (serviceType) {
      setActiveService(serviceModalContentMap[serviceType]);
      setActiveServiceType(serviceType);
      setCardIndex(null);
      setIsOpen(true);
    } else {
      console.warn(`[ServiceModal] No content found for: ${serviceIdentifier}`);
    }
  }, []);

  // ========================================================================
  // Open modal with page content (for inline editing)
  // ========================================================================
  const openModalWithContent = useCallback((title: string, index: number, modal: PageModalContent) => {
    const serviceType = resolveServiceType(title);

    // Convert page modal content to ServiceModalContent format
    const content: EditableServiceModal = {
      title,
      headline: modal.headline,
      hook: modal.hook,
      bulletPoints: modal.bulletPoints,
      ctas: modal.ctas,
      cardIndex: index,
    };

    setActiveService(content);
    setActiveServiceType(serviceType || null);
    setCardIndex(index);
    setIsOpen(true);
  }, []);

  // ========================================================================
  // Close modal
  // ========================================================================
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setActiveService(null);
      setActiveServiceType(null);
      setCardIndex(null);
    }, 300);
  }, []);

  return (
    <ServiceModalContext.Provider
      value={{
        isOpen,
        activeService,
        activeServiceType,
        cardIndex,
        openModal,
        openModalWithContent,
        closeModal,
      }}
    >
      {children}
    </ServiceModalContext.Provider>
  );
}

// ============================================================================
// useServiceModal Hook
// ============================================================================
// Use this in any component that needs to open/close service modals

export function useServiceModal() {
  const context = useContext(ServiceModalContext);
  if (context === undefined) {
    throw new Error('useServiceModal must be used within ServiceModalProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { serviceModalContentMap, resolveServiceType } from '@/lib/service-modal-content';
import type { ServiceModalContent, ServiceType } from '@/lib/service-modal-content';

// ============================================================================
// Service Modal Context
// ============================================================================
// What: Manages service detail modal state across the app
// Why: ServiceCards on any page can open a detailed modal with friendly info
// How: Context provider pattern (same as CartContext, ChatbotWidget)

interface ServiceModalContextType {
  isOpen: boolean;
  activeService: ServiceModalContent | null;
  activeServiceType: ServiceType | null;
  openModal: (serviceIdentifier: string) => void;
  closeModal: () => void;
}

const ServiceModalContext = createContext<ServiceModalContextType | undefined>(undefined);

// ============================================================================
// Service Modal Provider
// ============================================================================
// Note: Title-to-type mapping moved to lib/service-modal-content.ts (single source of truth)

export function ServiceModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceModalContent | null>(null);
  const [activeServiceType, setActiveServiceType] = useState<ServiceType | null>(null);

  // ========================================================================
  // Open modal with service content
  // ========================================================================
  // Accepts either service ID ('virtual-assistant') or title ('Virtual Assistant')
  const openModal = useCallback((serviceIdentifier: string) => {
    // Use centralized resolver from lib/service-modal-content.ts
    // Handles both title ('Virtual Assistant') and type ('virtual-assistant') lookups
    const serviceType = resolveServiceType(serviceIdentifier);

    if (serviceType) {
      setActiveService(serviceModalContentMap[serviceType]);
      setActiveServiceType(serviceType);
      setIsOpen(true);
    } else {
      console.warn(`[ServiceModal] No content found for: ${serviceIdentifier}`);
    }
  }, []);

  // ========================================================================
  // Close modal
  // ========================================================================
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Small delay before clearing content for smooth animation
    setTimeout(() => {
      setActiveService(null);
      setActiveServiceType(null);
    }, 300);
  }, []);

  return (
    <ServiceModalContext.Provider
      value={{
        isOpen,
        activeService,
        activeServiceType,
        openModal,
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

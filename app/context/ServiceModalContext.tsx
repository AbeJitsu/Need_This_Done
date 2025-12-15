'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { serviceModalContentMap } from '@/lib/service-modal-content';
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
// Title to Service Type Mapping
// ============================================================================
// Maps human-readable service titles to service type keys

const titleToServiceType: Record<string, ServiceType> = {
  'Virtual Assistant': 'virtual-assistant',
  'Data & Documents': 'data-documents',
  'Website Services': 'website-services',
};

// ============================================================================
// Service Modal Provider
// ============================================================================

export function ServiceModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceModalContent | null>(null);
  const [activeServiceType, setActiveServiceType] = useState<ServiceType | null>(null);

  // ========================================================================
  // Open modal with service content
  // ========================================================================
  // Accepts either service ID ('virtual-assistant') or title ('Virtual Assistant')
  const openModal = useCallback((serviceIdentifier: string) => {
    // Try to match by title first (what ServiceCard passes)
    let serviceType = titleToServiceType[serviceIdentifier] as ServiceType | undefined;

    // If not found by title, try as direct service type key
    if (!serviceType && serviceIdentifier in serviceModalContentMap) {
      serviceType = serviceIdentifier as ServiceType;
    }

    if (serviceType && serviceModalContentMap[serviceType]) {
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

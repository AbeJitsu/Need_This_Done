// ============================================================================
// Service Colors - Centralized service type to color mapping
// ============================================================================
// What: Maps service types to accent colors
// Why: DRY - same mapping was duplicated in ServiceDetailModal and ServiceDeepDive
// How: Import and use in any component that needs service-based coloring

import type { AccentColor } from './colors';
import type { ServiceType } from './service-modal-content';

// Re-export ServiceType for convenience
export type { ServiceType };

// Map service types to accent colors
export const serviceColors: Record<ServiceType, AccentColor> = {
  'virtual-assistant': 'green',
  'data-documents': 'blue',
  'website-services': 'purple',
};

// Helper function for safe color lookup with fallback
export function getServiceColor(serviceType: ServiceType | null | undefined): AccentColor {
  if (!serviceType) return 'blue';
  return serviceColors[serviceType] ?? 'blue';
}

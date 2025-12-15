'use client';

import ServiceCard from './ServiceCard';
import { useServiceModal } from '@/context/ServiceModalContext';
import type { AccentColor } from '@/lib/colors';

// ============================================================================
// ServiceCardWithModal - Client Component Wrapper
// ============================================================================
// What: Wraps ServiceCard with modal-opening functionality
// Why: The home page is a server component but needs to open modals on click
// How: Uses useServiceModal hook and passes onClick to ServiceCard

interface ServiceCardWithModalProps {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentColor;
  variant?: 'compact' | 'full';
}

export default function ServiceCardWithModal({
  title,
  tagline,
  description,
  details,
  color,
  variant = 'compact',
}: ServiceCardWithModalProps) {
  const { openModal } = useServiceModal();

  const handleClick = () => {
    openModal(title);
  };

  return (
    <ServiceCard
      title={title}
      tagline={tagline}
      description={description}
      details={details}
      color={color}
      variant={variant}
      onClick={handleClick}
    />
  );
}

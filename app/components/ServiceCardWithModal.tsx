'use client';

import ServiceCard from './ServiceCard';
import { useServiceModal } from '@/context/ServiceModalContext';
import type { AccentColor } from '@/lib/colors';
import type { ServiceModalContent } from '@/lib/page-config';

// ============================================================================
// ServiceCardWithModal - Client Component Wrapper
// ============================================================================
// What: Wraps ServiceCard with modal-opening functionality
// Why: The home page is a server component but needs to open modals on click
// How: Uses useServiceModal hook and passes onClick to ServiceCard
//
interface ServiceCardWithModalProps {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentColor;
  variant?: 'compact' | 'full';
  /** Text for the action link */
  linkText?: string;
  /** Optional content path retained for compatible card rendering */
  editBasePath?: string;
  /** Card index used to select modal content */
  cardIndex?: number;
  /** Modal content from the page catalog */
  modal?: ServiceModalContent;
  /** Optional icon to display in the card */
  icon?: React.ReactNode;
}

export default function ServiceCardWithModal({
  title,
  tagline,
  description,
  details,
  color,
  variant = 'compact',
  linkText = 'Learn more →',
  editBasePath,
  cardIndex,
  modal,
  icon,
}: ServiceCardWithModalProps) {
  const { openModal, openModalWithContent } = useServiceModal();

  // Open modal (called when clicking the card in non-edit mode)
  const openServiceModal = () => {
    if (modal && cardIndex !== undefined) {
      openModalWithContent(title, cardIndex, modal);
    } else {
      openModal(title);
    }
  };

  const handleClick = () => openServiceModal();

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openServiceModal();
  };

  return (
    <ServiceCard
        title={title}
        tagline={tagline}
        description={description}
        details={details}
        color={color}
        variant={variant}
        linkText={linkText}
        onClick={handleClick}
        onLinkClick={handleLinkClick}
        editBasePath={editBasePath}
        icon={icon}
    />
  );
}

'use client';

import { useState } from 'react';
import ServiceCard from './ServiceCard';
import { useServiceModal } from '@/context/ServiceModalContext';
import { useInlineEdit } from '@/context/InlineEditContext';
import ChoiceMenu from '@/components/InlineEditor/ChoiceMenu';
import type { AccentColor } from '@/lib/colors';
import type { ServiceModalContent } from '@/lib/page-config';

// ============================================================================
// ServiceCardWithModal - Client Component Wrapper
// ============================================================================
// What: Wraps ServiceCard with modal-opening functionality
// Why: The home page is a server component but needs to open modals on click
// How: Uses useServiceModal hook and passes onClick to ServiceCard
//
// Supports inline editing: When modal content is provided from page content,
// uses openModalWithContent which preserves the card index for editing.
// In edit mode, shows a choice menu: edit card content OR open modal for editing.

interface ServiceCardWithModalProps {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentColor;
  variant?: 'compact' | 'full';
  /** Text for the action link */
  linkText?: string;
  /** Base path for inline editing, e.g., "services.cards.0" */
  editBasePath?: string;
  /** Card index in the array (for inline editing) */
  cardIndex?: number;
  /** Modal content from page JSON (for inline editing) */
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
  const { isEditMode, startEditing } = useInlineEdit();
  const [showChoiceMenu, setShowChoiceMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [clickedElement, setClickedElement] = useState<HTMLElement | null>(null);

  // Open modal (called when clicking the card in non-edit mode)
  const openServiceModal = () => {
    if (modal && cardIndex !== undefined) {
      openModalWithContent(title, cardIndex, modal);
    } else {
      openModal(title);
    }
  };

  // Handle card click - open modal (non-edit mode only)
  const handleClick = () => {
    if (isEditMode) return; // In edit mode, only link triggers action
    openServiceModal();
  };

  // Handle link click - show choice menu in edit mode, otherwise open modal
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      // Store the clicked element for inline editing
      setClickedElement(e.currentTarget as HTMLElement);
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setShowChoiceMenu(true);
    } else {
      openServiceModal();
    }
  };

  // Edit the link text inline using TipTap
  const handleEditLink = () => {
    if (!clickedElement || cardIndex === undefined) return;

    startEditing({
      element: clickedElement,
      sectionKey: 'services',
      fieldPath: `cards.${cardIndex}.linkText`,
      fullPath: `services.cards.${cardIndex}.linkText`,
    });
  };

  const handleEditModal = () => {
    // Open the modal in edit mode
    if (modal && cardIndex !== undefined) {
      openModalWithContent(title, cardIndex, modal);
    }
  };

  return (
    <>
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

      {showChoiceMenu && (
        <ChoiceMenu
          position={menuPosition}
          onClose={() => setShowChoiceMenu(false)}
          options={[
            {
              label: 'Edit Link Text',
              icon: '🔗',
              action: handleEditLink,
            },
            {
              label: 'Edit Modal',
              icon: '📝',
              action: handleEditModal,
            },
          ]}
        />
      )}
    </>
  );
}

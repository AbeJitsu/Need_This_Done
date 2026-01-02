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
  /** Base path for inline editing, e.g., "services.cards.0" */
  editBasePath?: string;
  /** Card index in the array (for inline editing) */
  cardIndex?: number;
  /** Modal content from page JSON (for inline editing) */
  modal?: ServiceModalContent;
}

export default function ServiceCardWithModal({
  title,
  tagline,
  description,
  details,
  color,
  variant = 'compact',
  editBasePath,
  cardIndex,
  modal,
}: ServiceCardWithModalProps) {
  const { openModal, openModalWithContent } = useServiceModal();
  const { isEditMode, selectItem } = useInlineEdit();
  const [showChoiceMenu, setShowChoiceMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleClick = (e?: React.MouseEvent) => {
    // In edit mode, show choice menu
    if (isEditMode) {
      if (e) {
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowChoiceMenu(true);
      }
      return;
    }

    // Use page content if available (allows inline editing)
    if (modal && cardIndex !== undefined) {
      openModalWithContent(title, cardIndex, modal);
    } else {
      // Fall back to static content
      openModal(title);
    }
  };

  const handleEditCard = () => {
    // Select the card for sidebar editing
    if (cardIndex !== undefined) {
      selectItem({
        sectionKey: 'services',
        arrayField: 'cards',
        index: cardIndex,
        label: title,
        content: {
          title,
          tagline,
          description,
          details,
          color,
          modal,
        } as unknown as Record<string, unknown>,
      });
    }
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
        onClick={handleClick}
        editBasePath={editBasePath}
      />

      {showChoiceMenu && (
        <ChoiceMenu
          position={menuPosition}
          onClose={() => setShowChoiceMenu(false)}
          options={[
            {
              label: 'Edit Card',
              icon: '✏️',
              action: handleEditCard,
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

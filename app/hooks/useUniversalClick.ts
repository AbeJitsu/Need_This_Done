'use client';

import { useEffect, useCallback } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';
import {
  getClickedTextContent,
  findBestMatch,
  buildSelectionFromMatch,
  isEditableElement,
} from '@/lib/content-path-mapper';

// ============================================================================
// Universal Click Hook - Click any text to edit it
// ============================================================================
// What: Global click handler that auto-detects JSON paths from clicked text
// Why: Enables true universal editing - no wrappers needed
// How: Captures clicks in edit mode → finds text in content → opens editor

export function useUniversalClick() {
  const {
    isEditMode,
    pageContent,
    selectSection,
    selectItem,
    setSidebarOpen,
  } = useInlineEdit();

  const handleGlobalClick = useCallback(
    (event: MouseEvent) => {
      // Only active in edit mode
      if (!isEditMode) return;
      if (!pageContent) return;

      const target = event.target as HTMLElement;
      if (!target) return;

      // Skip if clicking admin UI elements
      if (target.closest('[data-testid="admin-sidebar"]')) return;
      if (target.closest('[data-testid="edit-mode-bar"]')) return;
      if (target.closest('[data-admin-ui="true"]')) return;

      // Skip if already handled by EditableSection/EditableItem
      // (they use stopPropagation, but this is a safety check)
      if (target.closest('[role="button"][aria-label^="Edit"]')) return;

      // Check if this is an editable element
      if (!isEditableElement(target)) return;

      // Get the text content from the clicked element
      const clickedText = getClickedTextContent(target);
      if (!clickedText || clickedText.length < 2) return;

      // Find the best match in the page content
      const match = findBestMatch(pageContent, clickedText);
      if (!match) return;

      // Prevent default behavior (link navigation, etc.)
      event.preventDefault();
      event.stopPropagation();

      // Build selection and open sidebar
      const { type, selection } = buildSelectionFromMatch(match, pageContent);

      if (type === 'item') {
        selectItem({
          sectionKey: selection.sectionKey as string,
          arrayField: selection.arrayField as string,
          index: selection.index as number,
          label: selection.label as string,
          content: selection.content as Record<string, unknown>,
        });
      } else {
        selectSection({
          sectionKey: selection.sectionKey as string,
          label: selection.label as string,
          content: selection.content as Record<string, unknown>,
        });
      }

      setSidebarOpen(true);
    },
    [isEditMode, pageContent, selectSection, selectItem, setSidebarOpen]
  );

  useEffect(() => {
    if (!isEditMode) return;

    // Use capture phase to intercept clicks before they reach elements
    document.addEventListener('click', handleGlobalClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [isEditMode, handleGlobalClick]);
}

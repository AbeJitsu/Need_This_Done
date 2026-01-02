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
// How: Captures clicks in edit mode → finds text in content → opens inline editor
//
// NEW: Opens inline TipTap editor for text fields, sidebar for arrays/objects

// Fields that should use single-line input (not multi-line)
const SINGLE_LINE_FIELDS = ['title', 'name', 'question', 'tagline', 'linkText', 'buttonText'];

// Fields that should always open sidebar (complex nested content)
const SIDEBAR_ONLY_FIELDS = ['buttons', 'cards', 'items', 'steps', 'options', 'scenarios'];

export function useUniversalClick() {
  const {
    isEditMode,
    pageContent,
    selectSection,
    selectItem,
    setSidebarOpen,
    openInlineEditor,
    inlineEditorState,
  } = useInlineEdit();

  const handleGlobalClick = useCallback(
    (event: MouseEvent) => {
      // Only active in edit mode
      if (!isEditMode) return;
      if (!pageContent) return;

      // Skip if inline editor is already open
      if (inlineEditorState?.isOpen) return;

      const target = event.target as HTMLElement;
      if (!target) return;

      // Skip if clicking admin UI elements
      if (target.closest('[data-testid="admin-sidebar"]')) return;
      if (target.closest('[data-testid="edit-mode-bar"]')) return;
      if (target.closest('[data-admin-ui="true"]')) return;

      // Skip if clicking directly on EditableSection's role="button" wrapper
      // But DO allow clicks on content INSIDE the wrapper (like h1, p, span)
      const editableWrapper = target.closest('[role="button"][aria-label^="Edit"]');
      if (editableWrapper && editableWrapper === target) return;

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

      // Determine if this is a simple text field or complex content
      const fieldName = match.path.split('.').pop() || '';
      const isSimpleTextField = typeof match.value === 'string';
      const isSidebarOnlyField = SIDEBAR_ONLY_FIELDS.some(f => match.path.includes(f));
      const isSingleLine = SINGLE_LINE_FIELDS.includes(fieldName);

      // For simple text fields, open inline editor
      if (isSimpleTextField && !isSidebarOnlyField) {
        const rect = target.getBoundingClientRect();

        // Extract section key and field path from match.path
        const pathParts = match.path.split('.');
        const sectionKey = pathParts[0];
        const fieldPath = pathParts.slice(1).join('.');

        openInlineEditor({
          sectionKey,
          fieldPath: fieldPath || '_value', // Handle root-level primitives
          position: {
            x: rect.left,
            y: rect.top,
            width: Math.max(rect.width, 300), // Minimum width for editor
          },
          content: match.value as string,
          singleLine: isSingleLine,
        });
        return;
      }

      // For complex content, open sidebar
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
    [isEditMode, pageContent, selectSection, selectItem, setSidebarOpen, openInlineEditor, inlineEditorState]
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

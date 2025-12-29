'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';
import { getDefaultContent } from '@/lib/default-page-content';
import type { EditablePageSlug, PageContent } from '@/lib/page-content-types';

// ============================================================================
// useEditableContent Hook
// ============================================================================
// What: Consolidates page content initialization for inline editing
// Why: Replaces 15+ lines of boilerplate with a single hook call
// How: Handles context setup, memoization, and content merging
//
// Usage:
//   const { content, updateField, pageSlug } = useEditableContent<MyPageContent>(
//     'my-page',
//     initialContent,
//     defaultContent // optional - auto-loaded if not provided
//   );

// ============================================================================
// Types
// ============================================================================

interface UseEditableContentResult<T extends PageContent> {
  /** The current content (with pending edits applied) */
  content: T;
  /** The page slug registered with the edit context */
  pageSlug: EditablePageSlug;
  /** Update a field value */
  updateField: (fieldPath: string, value: unknown) => void;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
}

// ============================================================================
// Deep Merge Helper
// ============================================================================

/**
 * Deep merge content with defaults.
 * Ensures all required fields exist by falling back to defaults.
 */
function deepMergeWithDefaults<T>(
  content: Partial<T>,
  defaults: T
): T {
  const result = { ...defaults } as T;
  const defaultsRecord = defaults as Record<string, unknown>;
  const contentRecord = content as Record<string, unknown>;

  for (const key of Object.keys(defaultsRecord)) {
    const contentValue = contentRecord[key];
    const defaultValue = defaultsRecord[key];

    if (contentValue !== undefined && contentValue !== null) {
      // If both are objects (not arrays), recurse
      if (
        typeof contentValue === 'object' &&
        typeof defaultValue === 'object' &&
        !Array.isArray(contentValue) &&
        !Array.isArray(defaultValue) &&
        contentValue !== null &&
        defaultValue !== null
      ) {
        (result as Record<string, unknown>)[key] = deepMergeWithDefaults(
          contentValue as Record<string, unknown>,
          defaultValue as Record<string, unknown>
        );
      } else {
        // Use content value directly
        (result as Record<string, unknown>)[key] = contentValue;
      }
    }
    // Otherwise keep the default
  }

  return result;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for initializing editable page content.
 *
 * Replaces the boilerplate pattern of:
 * - useMemo for safe content
 * - useEffect for context registration
 * - mergeWithDefaults function
 * - pageContent fallback logic
 *
 * @param slug - The page slug (must match EditablePageSlug type)
 * @param initialContent - Content passed from server component
 * @param defaults - Optional defaults (auto-loaded from getDefaultContent if not provided)
 *
 * @example
 * // In a page client component:
 * export default function ServicesPageClient({ content: initialContent }) {
 *   const { content, updateField } = useEditableContent<ServicesPageContent>(
 *     'services',
 *     initialContent
 *   );
 *
 *   return <div>{content.header.title}</div>;
 * }
 */
export function useEditableContent<T extends PageContent>(
  slug: EditablePageSlug,
  initialContent: T | Partial<T>,
  defaults?: T
): UseEditableContentResult<T> {
  const {
    setPageSlug,
    setPageContent,
    pageContent,
    updateField: contextUpdateField,
    hasUnsavedChanges,
  } = useInlineEdit();

  // Get defaults from the central store if not provided
  const resolvedDefaults = useMemo(() => {
    return (defaults ?? getDefaultContent(slug)) as T;
  }, [defaults, slug]);

  // Memoize merged content to prevent infinite re-renders
  // This is the key fix - without memoization, object creation
  // triggers useEffect, which sets state, which re-renders...
  const safeInitialContent = useMemo(
    () => deepMergeWithDefaults(initialContent as Partial<T>, resolvedDefaults),
    [initialContent, resolvedDefaults]
  );

  // Initialize the edit context when the component mounts
  useEffect(() => {
    setPageSlug(slug);
    setPageContent(safeInitialContent as unknown as Record<string, unknown>);
  }, [slug, safeInitialContent, setPageSlug, setPageContent]);

  // Get live content (with pending edits) or fall back to initial
  const liveContent = useMemo(() => {
    if (pageContent) {
      return deepMergeWithDefaults(
        pageContent as Partial<T>,
        resolvedDefaults
      );
    }
    return safeInitialContent;
  }, [pageContent, resolvedDefaults, safeInitialContent]);

  // Wrapper for updateField that uses the current section key
  const updateField = useCallback(
    (fieldPath: string, value: unknown) => {
      // The fieldPath should be relative to the page content root
      // For example: 'header.title' or 'items.0.name'
      const parts = fieldPath.split('.');
      const sectionKey = parts[0];
      const remainingPath = parts.slice(1).join('.') || '_value';

      contextUpdateField(sectionKey, remainingPath, value);
    },
    [contextUpdateField]
  );

  return {
    content: liveContent,
    pageSlug: slug,
    updateField,
    hasUnsavedChanges,
  };
}

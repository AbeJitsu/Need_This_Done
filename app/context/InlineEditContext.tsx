'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getPageSlugFromPath } from '@/lib/editable-routes';
import { getDefaultContent } from '@/lib/default-page-content';
import { DEFAULT_LAYOUT_CONTENT } from '@/lib/page-config';
import { getNestedValue, setNestedValue } from '@/lib/object-utils';
import {
  reorderArray,
  calculateNewSelectedIndex,
  parseItemFieldPath,
  getArrayPath,
  getReorderFieldPath,
} from '@/lib/inline-edit-utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// ============================================================================
// Inline Edit Context - Manage inline editing state for all pages
// ============================================================================
// What: Provides state and functions for inline content editing
// Why: Allows admins to click on page sections and edit them directly
// How: Tracks edit mode, selected section, and pending changes
//
// Uses section-based editing for marketing pages (Home, Services, etc.)
// Note: Legacy component-based editing state remains for backward compatibility

// ============================================================================
// Types - Section-based editing (marketing pages)
// ============================================================================

export interface SectionSelection {
  // The section key in the page content (e.g., "hero", "consultations")
  sectionKey: string;
  // Human-readable label for the section
  label: string;
  // The section's current content
  content: Record<string, unknown>;
  // Optional: path within the section for nested editing (e.g., "buttons.0")
  subPath?: string;
  // Optional: label for the current nested path
  subLabel?: string;
}

// Item selection for array items (cards, scenarios, steps, etc.)
export interface ItemSelection {
  // The section key containing the array (e.g., "services", "scenarioMatcher")
  sectionKey: string;
  // The array field name (e.g., "cards", "scenarios", "items")
  arrayField: string;
  // The index in the array
  index: number;
  // Human-readable label (e.g., "Data & Documents", "FAQ Item 3")
  label: string;
  // The item's current content
  content: Record<string, unknown>;
}

export interface PendingChange {
  // For section-based editing
  sectionKey: string;
  fieldPath: string;
  oldValue: unknown;
  newValue: unknown;
}

// ============================================================================
// Types - Active Edit State (new simple approach)
// ============================================================================

export interface ActiveEdit {
  // The DOM element being edited
  element: HTMLElement;
  // Section key (e.g., "hero", "services")
  sectionKey: string;
  // Field path within section (e.g., "title", "cards.0.description")
  fieldPath: string;
  // Full path for reference (e.g., "hero.title")
  fullPath: string;
  // Original content for cancel/undo
  originalContent: string;
  // For links: the href field path and original value
  hrefFieldPath?: string;
  originalHref?: string;
}

// ============================================================================
// Types - Inline Text Editor State (legacy - being replaced)
// ============================================================================

export interface InlineEditorState {
  // Is the inline editor open?
  isOpen: boolean;
  // Full path to the field being edited (e.g., "hero.title")
  fieldPath: string;
  // Section key for the field
  sectionKey: string;
  // Position on screen
  position: { x: number; y: number; width: number };
  // Current content value
  content: string;
  // Is rich text mode enabled?
  isRichMode: boolean;
  // Is this a single-line field (title) or multi-line (description)?
  singleLine: boolean;
}

// ============================================================================
// Types - Component-based editing (Legacy - unused)
// ============================================================================

export interface ComponentSelection {
  // Path to the component in the content tree (legacy)
  path: string;
  // The component type (e.g., "Hero", "TextBlock")
  type: string;
  // The component's current props
  props: Record<string, unknown>;
  // The zone the component is in (optional)
  zone?: string;
}

export interface LegacyPendingChange {
  path: string;
  propName: string;
  oldValue: unknown;
  newValue: unknown;
}

// ============================================================================
// Context Type
// ============================================================================

interface InlineEditContextType {
  // Is edit mode active?
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;

  // ========== Section-based editing (new) ==========

  // Currently selected section (null if none)
  selectedSection: SectionSelection | null;
  selectSection: (selection: SectionSelection | null) => void;

  // Currently selected item within a section (for array items like cards, scenarios)
  selectedItem: ItemSelection | null;
  selectItem: (selection: ItemSelection | null) => void;

  // Clear item selection (go back to section level)
  clearItemSelection: () => void;

  // Pending changes (before save)
  pendingChanges: PendingChange[];
  addPendingChange: (change: PendingChange) => void;
  clearPendingChanges: () => void;

  // Has unsaved changes?
  hasUnsavedChanges: boolean;

  // Current page content
  pageContent: Record<string, unknown> | null;
  setPageContent: (content: Record<string, unknown> | null) => void;

  // Page slug being edited
  pageSlug: string | null;
  setPageSlug: (slug: string | null) => void;

  // Is sidebar open?
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Update a field and track the change
  updateField: (sectionKey: string, fieldPath: string, newValue: unknown) => void;

  // Get the current value of a field (with pending changes applied)
  getFieldValue: (sectionKey: string, fieldPath: string) => unknown;

  // Reorder sections (for drag-and-drop)
  reorderSections: ((oldIndex: number, newIndex: number) => void) | null;
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;

  // Section registration (for DndContext)
  registerSection: (sectionKey: string) => void;
  unregisterSection: (sectionKey: string) => void;

  // Reorder items within an array (for nested drag-and-drop)
  reorderItems: ((sectionKey: string, arrayField: string, oldIndex: number, newIndex: number) => void) | null;

  // ========== Simple Inline Editing (new approach) ==========

  // Current active edit (element being edited)
  activeEdit: ActiveEdit | null;

  // Start editing an element
  startEditing: (params: {
    element: HTMLElement;
    sectionKey: string;
    fieldPath: string;
    fullPath: string;
    hrefFieldPath?: string;
    originalHref?: string;
  }) => void;

  // Save current edit and close (optionally with href for links)
  saveEdit: (newContent: string, newHref?: string) => void;

  // Cancel edit without saving
  cancelEdit: () => void;

  // ========== Inline Text Editor (legacy - being replaced) ==========

  // State for the inline text editor
  inlineEditorState: InlineEditorState | null;

  // Open the inline editor at a position
  openInlineEditor: (params: {
    sectionKey: string;
    fieldPath: string;
    position: { x: number; y: number; width: number };
    content: string;
    singleLine?: boolean;
  }) => void;

  // Close the inline editor (save or cancel handled separately)
  closeInlineEditor: () => void;

  // Toggle between rich and plain text mode
  toggleInlineEditorMode: () => void;

  // Update content in the inline editor
  updateInlineEditorContent: (content: string) => void;

  // ========== Component-based editing (Legacy - unused) ==========

  // Currently selected component (legacy - unused)
  selectedComponent: ComponentSelection | null;
  selectComponent: (selection: ComponentSelection | null) => void;

  // Legacy page data (unused)
  pageData: Record<string, unknown> | null;
  setPageData: (data: Record<string, unknown> | null) => void;

  // ========== Layout Content (Header/Footer) ==========

  // Layout content for header/footer editing
  layoutContent: Record<string, unknown> | null;
  setLayoutContent: (content: Record<string, unknown> | null) => void;

  // Update a layout field and track the change
  updateLayoutField: (section: 'header' | 'footer', fieldPath: string, newValue: unknown) => void;

  // Get the current value of a layout field
  getLayoutFieldValue: (section: 'header' | 'footer', fieldPath: string) => unknown;
}

// ============================================================================
// Context
// ============================================================================

const InlineEditContext = createContext<InlineEditContextType | undefined>(undefined);

// Note: getNestedValue and setNestedValue imported from @/lib/object-utils

// ============================================================================
// Provider
// ============================================================================

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Section-based editing state (new)
  const [selectedSection, setSelectedSection] = useState<SectionSelection | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemSelection | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [pageContent, setPageContent] = useState<Record<string, unknown> | null>(null);
  const [pageSlug, setPageSlug] = useState<string | null>(null);

  // Component-based editing state (Legacy - unused)
  const [selectedComponent, setSelectedComponent] = useState<ComponentSelection | null>(null);
  const [pageData, setPageData] = useState<Record<string, unknown> | null>(null);

  // Layout content state (header/footer - global)
  const [layoutContent, setLayoutContent] = useState<Record<string, unknown> | null>(null);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // Simple inline editing state (new approach)
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null);

  // Inline text editor state (Notion-style) - legacy
  const [inlineEditorState, setInlineEditorState] = useState<InlineEditorState | null>(null);

  // Section ordering for drag-and-drop
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  // ============================================================================
  // Universal Content Loading
  // ============================================================================
  // Auto-detect route and load content for editable pages.
  // This eliminates the need for useEditableContent() in each page.
  useEffect(() => {
    const slug = getPageSlugFromPath(pathname);

    // Skip if already loaded for this slug (prevents re-fetching on re-renders)
    if (slug === pageSlug && pageContent !== null) return;

    if (slug) {
      setPageSlug(slug);

      // Try to fetch from API first, fall back to defaults
      fetch(`/api/page-content/${slug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.content) {
            setPageContent(data.content);
          } else {
            // Use default content as fallback
            const defaults = getDefaultContent(slug);
            if (defaults) {
              setPageContent(defaults as unknown as Record<string, unknown>);
            }
          }
        })
        .catch(() => {
          // On error, use default content
          const defaults = getDefaultContent(slug);
          if (defaults) {
            setPageContent(defaults as unknown as Record<string, unknown>);
          }
        });
    } else {
      // Non-editable route - clear content
      if (pageContent !== null) {
        setPageContent(null);
        setPageSlug(null);
      }
    }
  }, [pathname, pageSlug, pageContent]);

  // ============================================================================
  // Layout Content Loading (Header/Footer - Global)
  // ============================================================================
  // Load layout content once on mount. This is global, not route-specific.
  useEffect(() => {
    if (layoutLoaded) return;

    setLayoutLoaded(true);

    fetch('/api/layout-content')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.content) {
          setLayoutContent(data.content);
        } else {
          // Use default content as fallback
          setLayoutContent(DEFAULT_LAYOUT_CONTENT as unknown as Record<string, unknown>);
        }
      })
      .catch(() => {
        // On error, use default content
        setLayoutContent(DEFAULT_LAYOUT_CONTENT as unknown as Record<string, unknown>);
      });
  }, [layoutLoaded]);

  const setEditMode = useCallback((enabled: boolean) => {
    setIsEditMode(enabled);
    if (!enabled) {
      // Clear all selections when exiting edit mode
      setSelectedSection(null);
      setSelectedItem(null);
      setSelectedComponent(null);
    }
  }, []);

  const selectSection = useCallback((selection: SectionSelection | null) => {
    setSelectedSection(selection);
    // Clear item selection when selecting a new section
    setSelectedItem(null);
  }, []);

  const selectItem = useCallback((selection: ItemSelection | null) => {
    setSelectedItem(selection);
  }, []);

  const clearItemSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const selectComponent = useCallback((selection: ComponentSelection | null) => {
    setSelectedComponent(selection);
  }, []);

  const addPendingChange = useCallback((change: PendingChange) => {
    setPendingChanges(prev => {
      // Replace existing change for same section+field or add new
      const existing = prev.findIndex(
        c => c.sectionKey === change.sectionKey && c.fieldPath === change.fieldPath
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = change;
        return updated;
      }
      return [...prev, change];
    });
  }, []);

  const clearPendingChanges = useCallback(() => {
    setPendingChanges([]);
  }, []);

  // Update a field and track the change
  const updateField = useCallback((sectionKey: string, fieldPath: string, newValue: unknown) => {
    if (!pageContent) return;

    // Handle primitive sections (wrapped with _value for editing)
    // When fieldPath is '_value', the original section is a primitive
    const isPrimitiveSection = fieldPath === '_value';
    const actualPath = isPrimitiveSection ? sectionKey : `${sectionKey}.${fieldPath}`;
    const oldValue = getNestedValue(pageContent, actualPath);

    // Add to pending changes
    addPendingChange({
      sectionKey,
      fieldPath,
      oldValue,
      newValue,
    });

    // Update page content with new value
    setPageContent(prev => {
      if (!prev) return prev;
      if (isPrimitiveSection) {
        // For primitive sections, set the value directly
        return { ...prev, [sectionKey]: newValue };
      }
      return setNestedValue(prev, actualPath, newValue);
    });

    // Update selected section content if it's the one being edited
    if (selectedSection && selectedSection.sectionKey === sectionKey) {
      setSelectedSection(prev => {
        if (!prev) return prev;
        if (isPrimitiveSection) {
          // Keep the _value wrapper for display consistency
          return { ...prev, content: { _value: newValue } };
        }
        return {
          ...prev,
          content: setNestedValue(prev.content, fieldPath, newValue),
        };
      });
    }

    // Update selected item content if it's the one being edited
    // fieldPath for items is like "0.answer" or "items.0.answer"
    if (selectedItem && selectedItem.sectionKey === sectionKey) {
      const isSameAsSection = selectedItem.sectionKey === selectedItem.arrayField || selectedItem.arrayField === '';
      const parsed = parseItemFieldPath(fieldPath, isSameAsSection);

      // Only update if this edit is for the currently selected item
      if (parsed && parsed.itemIndex === selectedItem.index && parsed.itemFieldPath) {
        setSelectedItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            content: setNestedValue(prev.content, parsed.itemFieldPath, newValue),
          };
        });
      }
    }
  }, [pageContent, selectedSection, selectedItem, addPendingChange]);

  // Get field value with pending changes applied
  const getFieldValue = useCallback((sectionKey: string, fieldPath: string): unknown => {
    if (!pageContent) return undefined;
    const fullPath = `${sectionKey}.${fieldPath}`;
    return getNestedValue(pageContent, fullPath);
  }, [pageContent]);

  // ============================================================================
  // Layout Content Functions (Header/Footer)
  // ============================================================================

  // Update a layout field (header or footer)
  const updateLayoutField = useCallback((
    section: 'header' | 'footer',
    fieldPath: string,
    newValue: unknown
  ) => {
    if (!layoutContent) return;

    const fullPath = `${section}.${fieldPath}`;
    const oldValue = getNestedValue(layoutContent, fullPath);

    // Add to pending changes (tracked as _layout section)
    addPendingChange({
      sectionKey: '_layout',
      fieldPath: fullPath,
      oldValue,
      newValue,
    });

    // Update layout content
    setLayoutContent(prev => {
      if (!prev) return prev;
      return setNestedValue(prev, fullPath, newValue);
    });
  }, [layoutContent, addPendingChange]);

  // Get a layout field value
  const getLayoutFieldValue = useCallback((
    section: 'header' | 'footer',
    fieldPath: string
  ): unknown => {
    if (!layoutContent) return undefined;
    const fullPath = `${section}.${fieldPath}`;
    return getNestedValue(layoutContent, fullPath);
  }, [layoutContent]);

  // Reorder sections (for drag-and-drop)
  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    setSectionOrder(prev => reorderArray(prev, oldIndex, newIndex));

    // Also add to pending changes to track the reorder
    addPendingChange({
      sectionKey: '_sectionOrder',
      fieldPath: 'order',
      oldValue: sectionOrder,
      newValue: null, // Will be computed from new state
    });
  }, [sectionOrder, addPendingChange]);

  // Section registration for DndContext
  const registerSection = useCallback((sectionKey: string) => {
    setSectionOrder(prev => {
      if (prev.includes(sectionKey)) return prev;
      return [...prev, sectionKey];
    });
  }, []);

  const unregisterSection = useCallback((sectionKey: string) => {
    setSectionOrder(prev => prev.filter(key => key !== sectionKey));
  }, []);

  // Reorder items within an array (for nested drag-and-drop)
  const reorderItems = useCallback((
    sectionKey: string,
    arrayField: string,
    oldIndex: number,
    newIndex: number
  ) => {
    if (!pageContent) return;

    const arrayPath = getArrayPath(sectionKey, arrayField);
    const currentArray = getNestedValue(pageContent, arrayPath) as unknown[];

    if (!Array.isArray(currentArray)) return;

    const newArray = reorderArray(currentArray, oldIndex, newIndex);

    // Update page content
    setPageContent(prev => {
      if (!prev) return prev;
      return setNestedValue(prev, arrayPath, newArray);
    });

    // Track the change
    addPendingChange({
      sectionKey,
      fieldPath: getReorderFieldPath(sectionKey, arrayField),
      oldValue: { oldIndex, newIndex },
      newValue: newArray,
    });

    // Update selected item index if it was affected by the reorder
    if (selectedItem && selectedItem.sectionKey === sectionKey && selectedItem.arrayField === arrayField) {
      const newSelectedIndex = calculateNewSelectedIndex(selectedItem.index, oldIndex, newIndex);
      if (newSelectedIndex !== null) {
        setSelectedItem(prev => prev ? { ...prev, index: newSelectedIndex } : null);
      }
    }
  }, [pageContent, selectedItem, addPendingChange]);

  // ============================================================================
  // Simple Inline Editing Functions (new approach)
  // ============================================================================

  const startEditing = useCallback((params: {
    element: HTMLElement;
    sectionKey: string;
    fieldPath: string;
    fullPath: string;
    hrefFieldPath?: string;
    originalHref?: string;
  }) => {
    // Check if this is a layout field
    const isLayoutField = params.sectionKey === '_layout';

    // Get current content from the appropriate source
    let currentValue: unknown;
    if (isLayoutField) {
      // Layout fields: fieldPath is like "header.brand"
      const parts = params.fieldPath.split('.');
      const layoutSection = parts[0] as 'header' | 'footer';
      const layoutFieldPath = parts.slice(1).join('.');
      currentValue = getLayoutFieldValue(layoutSection, layoutFieldPath);
    } else {
      currentValue = getFieldValue(params.sectionKey, params.fieldPath);
    }

    const originalContent = typeof currentValue === 'string' ? currentValue : params.element.innerHTML;

    setActiveEdit({
      element: params.element,
      sectionKey: params.sectionKey,
      fieldPath: params.fieldPath,
      fullPath: params.fullPath,
      originalContent,
      hrefFieldPath: params.hrefFieldPath,
      originalHref: params.originalHref,
    });

    // Close sidebar when editing inline
    setIsSidebarOpen(false);
  }, [getFieldValue, getLayoutFieldValue]);

  const saveEdit = useCallback((newContent: string, newHref?: string) => {
    if (!activeEdit) return;

    // Check if this is a layout field (header/footer)
    const isLayoutField = activeEdit.sectionKey === '_layout';

    // Only update if content changed
    if (newContent !== activeEdit.originalContent) {
      if (isLayoutField) {
        // Layout fields: "_layout" section with fieldPath like "header.brand"
        const parts = activeEdit.fieldPath.split('.');
        const layoutSection = parts[0] as 'header' | 'footer';
        const layoutFieldPath = parts.slice(1).join('.');
        updateLayoutField(layoutSection, layoutFieldPath, newContent);
      } else {
        updateField(activeEdit.sectionKey, activeEdit.fieldPath, newContent);
      }
    }

    // Also update href if provided and changed
    if (newHref !== undefined && activeEdit.hrefFieldPath && newHref !== activeEdit.originalHref) {
      if (isLayoutField) {
        const parts = activeEdit.hrefFieldPath.split('.');
        const layoutSection = parts[0] as 'header' | 'footer';
        const layoutFieldPath = parts.slice(1).join('.');
        updateLayoutField(layoutSection, layoutFieldPath, newHref);
      } else {
        updateField(activeEdit.sectionKey, activeEdit.hrefFieldPath, newHref);
      }
    }

    setActiveEdit(null);
  }, [activeEdit, updateField, updateLayoutField]);

  const cancelEdit = useCallback(() => {
    setActiveEdit(null);
  }, []);

  // ============================================================================
  // Inline Text Editor Functions (legacy - being replaced)
  // ============================================================================

  const openInlineEditor = useCallback((params: {
    sectionKey: string;
    fieldPath: string;
    position: { x: number; y: number; width: number };
    content: string;
    singleLine?: boolean;
  }) => {
    setInlineEditorState({
      isOpen: true,
      sectionKey: params.sectionKey,
      fieldPath: params.fieldPath,
      position: params.position,
      content: params.content,
      isRichMode: true, // Default to rich mode
      singleLine: params.singleLine ?? false,
    });
    // Close sidebar when inline editor opens
    setIsSidebarOpen(false);
  }, []);

  const closeInlineEditor = useCallback(() => {
    setInlineEditorState(null);
  }, []);

  const toggleInlineEditorMode = useCallback(() => {
    setInlineEditorState(prev => {
      if (!prev) return null;
      return { ...prev, isRichMode: !prev.isRichMode };
    });
  }, []);

  const updateInlineEditorContent = useCallback((content: string) => {
    setInlineEditorState(prev => {
      if (!prev) return null;
      return { ...prev, content };
    });
  }, []);

  // DndContext sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);
      }
    }
  }, [sectionOrder, reorderSections]);

  const value: InlineEditContextType = {
    isEditMode,
    setEditMode,
    // Section-based (new)
    selectedSection,
    selectSection,
    selectedItem,
    selectItem,
    clearItemSelection,
    pendingChanges,
    addPendingChange,
    clearPendingChanges,
    hasUnsavedChanges: pendingChanges.length > 0,
    pageContent,
    setPageContent,
    pageSlug,
    setPageSlug,
    isSidebarOpen,
    setSidebarOpen: setIsSidebarOpen,
    updateField,
    getFieldValue,
    // Section reordering
    reorderSections,
    sectionOrder,
    setSectionOrder,
    // Section registration
    registerSection,
    unregisterSection,
    // Item reordering (nested drag-and-drop)
    reorderItems,
    // Simple inline editing (new approach)
    activeEdit,
    startEditing,
    saveEdit,
    cancelEdit,
    // Inline text editor (legacy)
    inlineEditorState,
    openInlineEditor,
    closeInlineEditor,
    toggleInlineEditorMode,
    updateInlineEditorContent,
    // Component-based (Legacy - unused)
    selectedComponent,
    selectComponent,
    pageData,
    setPageData,
    // Layout content (header/footer)
    layoutContent,
    setLayoutContent,
    updateLayoutField,
    getLayoutFieldValue,
  };

  // Wrap children with DndContext only when edit mode is active
  const content = isEditMode ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  ) : (
    children
  );

  return (
    <InlineEditContext.Provider value={value}>
      <div data-section-order={JSON.stringify(sectionOrder)}>
        {content}
      </div>
    </InlineEditContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useInlineEdit() {
  const context = useContext(InlineEditContext);
  if (context === undefined) {
    throw new Error('useInlineEdit must be used within an InlineEditProvider');
  }
  return context;
}

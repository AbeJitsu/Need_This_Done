'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// Inline Edit Context - Manage inline editing state for Puck pages
// ============================================================================
// What: Provides state and functions for inline component editing
// Why: Allows admins to click on components and edit them directly
// How: Tracks edit mode, selected component, and pending changes

// ============================================================================
// Types
// ============================================================================

export interface ComponentSelection {
  // The component's path in the Puck data structure (e.g., "content.0")
  path: string;
  // The component type (e.g., "Hero", "TextBlock")
  type: string;
  // The component's current props
  props: Record<string, unknown>;
  // Zone the component is in (e.g., "root", "column-1")
  zone?: string;
}

export interface PendingChange {
  path: string;
  propName: string;
  oldValue: unknown;
  newValue: unknown;
}

interface InlineEditContextType {
  // Is edit mode active?
  isEditMode: boolean;
  // Toggle edit mode on/off
  setEditMode: (enabled: boolean) => void;

  // Currently selected component (null if none)
  selectedComponent: ComponentSelection | null;
  // Select a component for editing
  selectComponent: (selection: ComponentSelection | null) => void;

  // Pending changes (before save)
  pendingChanges: PendingChange[];
  // Add a pending change
  addPendingChange: (change: PendingChange) => void;
  // Clear all pending changes
  clearPendingChanges: () => void;

  // Has unsaved changes?
  hasUnsavedChanges: boolean;

  // Page data being edited
  pageData: Record<string, unknown> | null;
  setPageData: (data: Record<string, unknown> | null) => void;

  // Page slug being edited
  pageSlug: string | null;
  setPageSlug: (slug: string | null) => void;

  // Is sidebar open?
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// ============================================================================
// Context
// ============================================================================

const InlineEditContext = createContext<InlineEditContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentSelection | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [pageData, setPageData] = useState<Record<string, unknown> | null>(null);
  const [pageSlug, setPageSlug] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setEditMode = useCallback((enabled: boolean) => {
    setIsEditMode(enabled);
    if (!enabled) {
      // Clear selection and close sidebar when exiting edit mode
      setSelectedComponent(null);
      setIsSidebarOpen(false);
    }
  }, []);

  const selectComponent = useCallback((selection: ComponentSelection | null) => {
    setSelectedComponent(selection);
    // Open sidebar when selecting, close when deselecting
    setIsSidebarOpen(selection !== null);
  }, []);

  const addPendingChange = useCallback((change: PendingChange) => {
    setPendingChanges(prev => {
      // Replace existing change for same path+prop or add new
      const existing = prev.findIndex(
        c => c.path === change.path && c.propName === change.propName
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

  const value: InlineEditContextType = {
    isEditMode,
    setEditMode,
    selectedComponent,
    selectComponent,
    pendingChanges,
    addPendingChange,
    clearPendingChanges,
    hasUnsavedChanges: pendingChanges.length > 0,
    pageData,
    setPageData,
    pageSlug,
    setPageSlug,
    isSidebarOpen,
    setSidebarOpen: setIsSidebarOpen,
  };

  return (
    <InlineEditContext.Provider value={value}>
      {children}
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

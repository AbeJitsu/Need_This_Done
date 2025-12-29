// @ts-nocheck
// DEPRECATED: This component has been replaced by AdminSidebar and AdminSidebarToggle.
// It remains in the codebase for reference but is no longer exported or used.

'use client';

import { useState } from 'react';
import { useInlineEdit, type PendingChange } from '@/context/InlineEditContext';
import { useAuth } from '@/context/AuthContext';
import { solidButtonColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Admin Edit Bar - Floating toolbar for inline editing controls
// ============================================================================
// What: Shows edit mode toggle and save/discard buttons for admins
// Why: Provides easy access to inline editing functionality
// How: Appears at top of page when admin is viewing, controls edit mode state

interface AdminEditBarProps {
  pageSlug?: string;
  onSave?: () => Promise<void>;
}

// Apply pending changes to page data to create updated content
function applyChangesToPageData(
  pageData: Record<string, unknown>,
  pendingChanges: PendingChange[]
): Record<string, unknown> {
  // Deep clone the page data
  const updatedData = JSON.parse(JSON.stringify(pageData));

  // Apply each pending change
  for (const change of pendingChanges) {
    // Parse path like "content.0" to get the component index
    const pathParts = change.path.split('.');
    if (pathParts[0] === 'content' && pathParts.length === 2) {
      const componentIndex = parseInt(pathParts[1], 10);
      if (updatedData.content && updatedData.content[componentIndex]) {
        // Update the specific prop
        if (!updatedData.content[componentIndex].props) {
          updatedData.content[componentIndex].props = {};
        }
        updatedData.content[componentIndex].props[change.propName] = change.newValue;
      }
    }
  }

  return updatedData;
}

export default function AdminEditBar({ pageSlug: propSlug, onSave }: AdminEditBarProps) {
  const { isAdmin, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    isEditMode,
    setEditMode,
    hasUnsavedChanges,
    pendingChanges,
    clearPendingChanges,
    setPageSlug,
    pageSlug: contextSlug,
    pageData,
  } = useInlineEdit();

  // Use prop slug or context slug
  const currentSlug = propSlug || contextSlug;

  // Only show for authenticated admins on Puck pages
  // If no page slug is set, this isn't a Puck page - don't show the bar
  if (!isAuthenticated || !isAdmin || !currentSlug) {
    return null;
  }

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode
      if (hasUnsavedChanges) {
        const confirmDiscard = window.confirm(
          'You have unsaved changes. Discard them?'
        );
        if (!confirmDiscard) return;
        clearPendingChanges();
      }
      setEditMode(false);
    } else {
      // Entering edit mode - only if we have a page slug
      if (currentSlug) {
        setPageSlug(currentSlug);
        setEditMode(true);
      }
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
      clearPendingChanges();
      return;
    }

    // Default save behavior - call the API
    if (!currentSlug || !pageData || pendingChanges.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Apply pending changes to page data
      const updatedContent = applyChangesToPageData(pageData, pendingChanges);

      // Save to API
      const response = await fetch(`/api/pages/${currentSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: updatedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      // Clear changes and reload the page to show saved content
      clearPendingChanges();

      // Force page reload to show saved content
      window.location.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    const confirmDiscard = window.confirm(
      'Discard all changes?'
    );
    if (confirmDiscard) {
      clearPendingChanges();
      setSaveError(null);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left side - Edit mode info */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {isEditMode ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Edit Mode
              </span>
            ) : (
              <span className="text-gray-400">Admin View</span>
            )}
          </span>
          {isEditMode && hasUnsavedChanges && (
            <span className="text-xs bg-orange-500 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
          {saveError && (
            <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full">
              {saveError}
            </span>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!hasUnsavedChanges}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg
                  ${hasUnsavedChanges
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                  transition-colors ${focusRingClasses.blue}
                `}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg
                  ${hasUnsavedChanges && !isSaving
                    ? `${solidButtonColors.green.bg} ${solidButtonColors.green.hover} ${solidButtonColors.green.text}`
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                  transition-colors ${focusRingClasses.green}
                `}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleToggleEditMode}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg
                  bg-gray-700 hover:bg-gray-600 text-white
                  transition-colors ${focusRingClasses.blue}
                `}
              >
                Exit Edit Mode
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleToggleEditMode}
              disabled={!currentSlug}
              title={currentSlug ? 'Enter edit mode' : 'Navigate to a Puck page to enable editing'}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                ${currentSlug
                  ? `${solidButtonColors.blue.bg} ${solidButtonColors.blue.hover} ${solidButtonColors.blue.text}`
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
                ${focusRingClasses.blue}
              `}
            >
              Enter Edit Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useInlineEdit } from '@/context/InlineEditContext';
import { useAuth } from '@/context/AuthContext';
import { solidButtonColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Admin Edit Bar - Floating toolbar for inline editing controls
// ============================================================================
// What: Shows edit mode toggle and save/discard buttons for admins
// Why: Provides easy access to inline editing functionality
// How: Appears at top of page when admin is viewing, controls edit mode state

interface AdminEditBarProps {
  pageSlug: string;
  onSave?: () => Promise<void>;
}

export default function AdminEditBar({ pageSlug, onSave }: AdminEditBarProps) {
  const { isAdmin, isAuthenticated } = useAuth();
  const {
    isEditMode,
    setEditMode,
    hasUnsavedChanges,
    clearPendingChanges,
    setPageSlug,
  } = useInlineEdit();

  // Only show for authenticated admins
  if (!isAuthenticated || !isAdmin) {
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
      // Entering edit mode
      setPageSlug(pageSlug);
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
      clearPendingChanges();
    }
  };

  const handleDiscard = () => {
    const confirmDiscard = window.confirm(
      'Discard all changes?'
    );
    if (confirmDiscard) {
      clearPendingChanges();
      // Could also reload the page data here
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
                disabled={!hasUnsavedChanges}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg
                  ${hasUnsavedChanges
                    ? `${solidButtonColors.green.bg} ${solidButtonColors.green.hover} ${solidButtonColors.green.text}`
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                  transition-colors ${focusRingClasses.green}
                `}
              >
                Save
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
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg
                ${solidButtonColors.blue.bg} ${solidButtonColors.blue.hover} ${solidButtonColors.blue.text}
                transition-colors ${focusRingClasses.blue}
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

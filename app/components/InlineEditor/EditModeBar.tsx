'use client';

import { useEffect, useCallback } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// EditModeBar - Top bar showing edit mode status with exit button
// ============================================================================
// What: Fixed bar at top of viewport when edit mode is active
// Why: Lets admins know they're in edit mode and provides a way to exit
// How: Uses InlineEditContext to check/toggle edit mode

export default function EditModeBar() {
  const { isEditMode, setEditMode, selectedSection, selectedItem, selectSection, clearItemSelection } = useInlineEdit();

  const handleExitEditMode = useCallback(() => {
    // Clear all selections first
    selectSection(null);
    clearItemSelection();
    // Then exit edit mode
    setEditMode(false);
  }, [selectSection, clearItemSelection, setEditMode]);

  // Listen for Escape key to exit edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExitEditMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, handleExitEditMode]);

  if (!isEditMode) return null;

  // Build status text
  let statusText = 'Click any section or item to edit';
  if (selectedItem) {
    statusText = `Editing: ${selectedItem.label}`;
  } else if (selectedSection) {
    statusText = `Editing section: ${selectedSection.label}`;
  }

  return (
    // z-[60] is higher than sidebar (z-50) so the Exit button remains clickable
    <div className="fixed top-0 left-0 right-0 z-[60] bg-purple-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="font-semibold">Edit Mode</span>
        <span className="text-purple-200 text-sm hidden sm:inline">|</span>
        <span className="text-purple-100 text-sm hidden sm:inline">{statusText}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-purple-200 text-xs hidden md:inline">Press Esc or</span>
        <button
          onClick={handleExitEditMode}
          className="px-3 py-1 bg-white text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
        >
          Exit Edit Mode
        </button>
      </div>
    </div>
  );
}

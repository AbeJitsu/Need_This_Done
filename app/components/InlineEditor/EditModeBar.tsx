'use client';
import { accentText } from '@/lib/contrast';

import { useEffect, useCallback } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// EditModeBar - Left vertical bar showing edit mode status with exit button
// ============================================================================
// What: Fixed bar on left side of viewport when edit mode is active
// Why: Lets admins know they're in edit mode without blocking header
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
  let statusText = 'Click to edit';
  if (selectedItem) {
    statusText = selectedItem.label;
  } else if (selectedSection) {
    statusText = selectedSection.label;
  }

  return (
    // Vertical bar on left side - doesn't block header
    <div
      data-admin-ui="true"
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] bg-purple-600 text-white px-2 py-4 flex flex-col items-center gap-4 shadow-lg rounded-r-lg"
    >
      {/* Vertical label */}
      <div
        className="font-semibold text-sm whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
      >
        Edit Mode
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-purple-400" />

      {/* Status text */}
      <div
        className="text-purple-100 text-xs max-w-[1.5rem] text-center"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
        title={statusText}
      >
        {statusText.length > 20 ? `${statusText.slice(0, 17)}...` : statusText}
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-purple-400" />

      {/* Exit button */}
      <button
        onClick={handleExitEditMode}
        className={`p-2 bg-white ${accentText.purple} rounded-md text-sm font-medium hover:bg-purple-100 transition-colors`}
        title="Exit Edit Mode (Esc)"
        aria-label="Exit Edit Mode"
      >
        ✕
      </button>
    </div>
  );
}

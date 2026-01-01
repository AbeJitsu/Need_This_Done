// ============================================================================
// Sidebar Footer - Save/Cancel actions for AdminSidebar
// ============================================================================
// What: The footer with save, discard, and version history buttons
// Why: Extracted from AdminSidebar to reduce its size and improve maintainability
// How: Receives state and callbacks for save/discard operations

import { formInputColors, solidButtonColors } from '@/lib/colors';

interface SidebarFooterProps {
  saveError: string | null;
  hasUnsavedChanges: boolean;
  pendingChangesCount: number;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
}

export default function SidebarFooter({
  saveError,
  hasUnsavedChanges,
  pendingChangesCount,
  isSaving,
  onDiscard,
  onSave,
  onOpenHistory,
}: SidebarFooterProps) {
  return (
    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {saveError && (
        <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
      )}

      {hasUnsavedChanges && (
        <p className={`text-xs ${formInputColors.helper}`}>
          {pendingChangesCount} unsaved change{pendingChangesCount !== 1 ? 's' : ''}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={!hasUnsavedChanges || isSaving}
          className={`
            flex-1 px-4 py-2 rounded-lg text-sm font-medium
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-100 dark:hover:bg-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={`
            flex-1 px-4 py-2 rounded-lg text-sm font-medium
            ${solidButtonColors.blue.bg} ${solidButtonColors.blue.hover} ${solidButtonColors.blue.text}
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Version History Button */}
      <button
        type="button"
        onClick={onOpenHistory}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Version History
      </button>
    </div>
  );
}

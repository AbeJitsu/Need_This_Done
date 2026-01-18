// ============================================================================
// Sidebar Header - Fixed header for AdminSidebar
// ============================================================================
// What: The top bar with title, page info, and close button
// Why: Extracted from AdminSidebar to reduce its size and improve maintainability
// How: Receives pageSlug and onClose callback

import { headingColors, formInputColors } from '@/lib/colors';

interface SidebarHeaderProps {
  pageSlug: string | null;
  onClose: () => void;
}

export default function SidebarHeader({ pageSlug, onClose }: SidebarHeaderProps) {
  return (
    <div className="flex-shrink-0 border-b border-gray-400 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className={`font-semibold ${headingColors.primary}`}>
          Page Editor
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close editor"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {pageSlug && (
        <p className={`text-xs ${formInputColors.helper}`}>
          Editing: {pageSlug === 'home' ? 'Homepage' : pageSlug.replace(/-/g, ' ')}
        </p>
      )}
    </div>
  );
}

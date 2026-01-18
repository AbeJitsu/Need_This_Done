// ============================================================================
// Section List View - Displays clickable list of page sections
// ============================================================================
// What: The initial view showing all editable sections for a page
// Why: Extracted from AdminSidebar to reduce its size
// How: Renders a list of buttons, each selecting a section to edit

import { accentText } from '@/lib/contrast';
import { formInputColors, headingColors } from '@/lib/colors';

interface Section {
  key: string;
  label: string;
}

interface SectionListViewProps {
  sections: Section[];
  onSelectSection: (sectionKey: string) => void;
}

export default function SectionListView({ sections, onSelectSection }: SectionListViewProps) {
  return (
    <div className="space-y-2">
      {/* Helpful tip for users */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
        <p className={`text-sm ${accentText.blue} font-medium mb-1`}>
          💡 Tip: Click anywhere on the page
        </p>
        <p className={`text-xs ${accentText.blue}`}>
          Click on text, cards, or buttons to edit them directly. Or choose a section below.
        </p>
      </div>

      <p className={`text-sm ${formInputColors.helper} mb-2`}>
        Sections:
      </p>
      {sections.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelectSection(key)}
          className={`
            w-full text-left px-4 py-3 rounded-lg
            border border-gray-400 dark:border-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:border-blue-300 dark:hover:border-blue-600
            transition-all duration-150
            group
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`font-medium text-sm ${headingColors.secondary}`}>
              {label}
            </span>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-accent-blue transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}

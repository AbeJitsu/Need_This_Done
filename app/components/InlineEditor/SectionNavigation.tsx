// ============================================================================
// Section Navigation - Breadcrumb and back navigation for AdminSidebar
// ============================================================================
// What: Navigation components for section and item editing views
// Why: Extracted from AdminSidebar to reduce duplication and improve maintainability
// How: Provides BackButton and BreadcrumbPath components

import { accentText } from '@/lib/contrast';
import { accentColors, headingColors, formInputColors } from '@/lib/colors';

// ============================================================================
// Back Button - Consistent back navigation
// ============================================================================
interface BackButtonProps {
  onClick: () => void;
  label: string;
}

export function BackButton({ onClick, label }: BackButtonProps) {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onClick}
        className={`
          flex items-center gap-2 text-sm font-medium
          ${accentColors.blue.text} hover:underline
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {label}
      </button>
    </div>
  );
}

// ============================================================================
// Section Header - Title bar for current section/item being edited
// ============================================================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="pb-3 mb-4 border-b border-gray-400 dark:border-gray-700">
      <h3 className={`font-medium ${headingColors.primary}`}>
        {title}
      </h3>
      {subtitle && (
        <p className={`text-xs ${formInputColors.helper} mt-1`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Item Breadcrumb - Shows path for item editing (section → item)
// ============================================================================
interface ItemBreadcrumbProps {
  sectionLabel: string;
  itemLabel: string;
}

export function ItemBreadcrumb({ sectionLabel, itemLabel }: ItemBreadcrumbProps) {
  return (
    <div className="pb-3 mb-4 border-b border-gray-400 dark:border-gray-700">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{sectionLabel}</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className={`${accentText.purple} font-medium`}>
          {itemLabel}
        </span>
      </div>
      <h3 className={`font-medium ${headingColors.primary}`}>
        {itemLabel}
      </h3>
    </div>
  );
}

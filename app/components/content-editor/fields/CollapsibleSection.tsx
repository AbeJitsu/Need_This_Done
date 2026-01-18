'use client';

import { useState, ReactNode } from 'react';
import { uiChromeBg, cardBgColors } from '@/lib/colors';

// ============================================================================
// CollapsibleSection - Accordion Wrapper for Form Sections
// ============================================================================
// What: Groups related fields under a collapsible header
// Why: Keeps the form organized and prevents overwhelm
// How: Click header to toggle visibility, animated expand/collapse

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  className?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  badge,
  className = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`
        border-2 border-gray-400 dark:border-gray-700 rounded-xl overflow-hidden
        transition-colors duration-200
        ${isOpen ? cardBgColors.base : uiChromeBg.panel}
        ${className}
      `}
    >
      {/* Header - clickable to toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full px-4 py-3 flex items-center justify-between
          text-left hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150
        "
      >
        <div className="flex items-center gap-2">
          {/* Chevron icon */}
          <svg
            className={`
              w-5 h-5 text-gray-400 dark:text-gray-500
              transition-transform duration-200
              ${isOpen ? 'rotate-90' : ''}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          <span className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </span>

          {badge && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {badge}
            </span>
          )}
        </div>

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {isOpen ? 'Click to collapse' : 'Click to expand'}
        </span>
      </button>

      {/* Content - animated visibility */}
      <div
        className={`
          transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

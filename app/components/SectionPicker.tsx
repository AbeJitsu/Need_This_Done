'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  getAllSections,
  getSectionsByCategory,
  getCategoriesWithSections,
  searchSections,
  type SectionDefinition,
  type SectionCategory,
} from '@/lib/sections';
import { accentColors, hoverBgColors, cardBgColors, cardBorderColors } from '@/lib/colors';

// ============================================================================
// SectionPicker Component
// ============================================================================
// What: UI for browsing and selecting pre-built page sections
// Why: Let users add complete sections instead of building from scratch
// How: Category tabs, search, preview cards, and selection callback

type AccentColor = 'blue' | 'green' | 'purple';

export interface SectionPickerProps {
  onSelect: (section: SectionDefinition) => void;
  onClose?: () => void;
  color?: AccentColor;
  className?: string;
}

export default function SectionPicker({
  onSelect,
  onClose,
  color = 'blue',
  className = '',
}: SectionPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const colors = accentColors[color];

  const categories = useMemo(() => getCategoriesWithSections(), []);

  const filteredSections = useMemo(() => {
    let result: SectionDefinition[];

    if (searchQuery) {
      result = searchSections(searchQuery);
    } else if (selectedCategory === 'all') {
      result = getAllSections();
    } else {
      result = getSectionsByCategory(selectedCategory);
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const handleSelect = useCallback((section: SectionDefinition) => {
    onSelect(section);
    onClose?.();
  }, [onSelect, onClose]);

  return (
    <div
      className={`${cardBgColors.base} rounded-xl shadow-xl ${cardBorderColors.light} overflow-hidden ${className}`}
      data-testid="section-picker"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add a Section
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close section picker"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search sections"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2" role="tablist">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              ${selectedCategory === 'all'
                ? `${colors.bg} ${colors.text}`
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              transition-colors
            `}
            role="tab"
            aria-selected={selectedCategory === 'all'}
          >
            All Sections
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchQuery('');
              }}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                ${selectedCategory === category.id
                  ? `${colors.bg} ${colors.text}`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                transition-colors
              `}
              role="tab"
              aria-selected={selectedCategory === category.id}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section Grid */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No sections found</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`mt-2 text-sm ${colors.text} hover:underline`}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSelect(section)}
                className={`group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-100 dark:bg-gray-900 ${hoverBgColors.blue} transition-colors text-left`}
                data-testid="section-card"
              >
                {/* Icon */}
                <div className="text-3xl mb-2">{section.icon}</div>

                {/* Name */}
                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {section.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {section.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {section.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
}

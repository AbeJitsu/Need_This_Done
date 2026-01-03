'use client';

import { useState, useMemo } from 'react';
import type { PageTemplate, TemplateCategory } from '@/lib/templates';
import {
  filterByCategory,
  searchTemplates,
  sortTemplates,
  CATEGORY_INFO,
  ALL_CATEGORIES,
} from '@/lib/templates';
import { accentColors, cardBgColors } from '@/lib/colors';

// ============================================================================
// TEMPLATE PICKER COMPONENT
// ============================================================================
// A phone-friendly UI for browsing and selecting page templates.
// Orthogonal: Only displays templates, doesn't know about wizard or storage.
//
// Props:
// - templates: The templates to display
// - onSelect: Called when user picks a template
// - selectedId: Currently selected template (for highlighting)
// ============================================================================

interface TemplatePickerProps {
  templates: PageTemplate[];
  onSelect: (template: PageTemplate) => void;
  selectedId?: string;
}

export default function TemplatePicker({
  templates,
  onSelect,
  selectedId,
}: TemplatePickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');

  // Filter and sort templates
  const displayedTemplates = useMemo(() => {
    let result = templates;

    // Filter by category
    if (activeCategory !== 'all') {
      result = filterByCategory(result, activeCategory);
    }

    // Filter by search
    if (search.trim()) {
      result = searchTemplates(result, search);
    }

    // Sort (featured first)
    return sortTemplates(result);
  }, [templates, activeCategory, search]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar - Touch-friendly height */}
      <div className="mb-4">
        <div className="relative">
          <label htmlFor="template-search" className="sr-only">
            Search templates
          </label>
          <input
            id="template-search"
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 ${cardBgColors.base} text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category Tabs - Horizontally scrollable on mobile */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          {/* All tab */}
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Templates
          </button>

          {/* Category tabs */}
          {ALL_CATEGORIES.map((cat) => {
            const info = CATEGORY_INFO[cat];
            const count = filterByCategory(templates, cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid - Responsive columns */}
      {displayedTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTemplates.map((template) => (
            <TemplateCard
              key={template.metadata.id}
              template={template}
              isSelected={selectedId === template.metadata.id}
              onSelect={() => onSelect(template)}
            />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No templates found
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('all');
            }}
            className="mt-2 text-purple-600 dark:text-purple-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Template Card - Individual template display with visual preview
// ============================================================================

interface TemplateCardProps {
  template: PageTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

// Icons for different section types (used in preview)
const SECTION_ICONS: Record<string, string> = {
  Hero: '🎯',
  FeatureGrid: '⭐',
  Testimonials: '💬',
  PricingTable: '💰',
  Accordion: '📋',
  CallToAction: '📢',
  VideoEmbed: '🎬',
  RichText: '📝',
  Image: '🖼️',
  ProductGrid: '🛒',
  StatsCounter: '📊',
};

// Gradient backgrounds for template previews based on color
const PREVIEW_GRADIENTS: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  gold: 'from-gold-500 to-gold-600',
  teal: 'from-teal-500 to-teal-600',
  gray: 'from-gray-500 to-gray-600',
};

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const { metadata, defaultColor, sections } = template;
  const colors = accentColors[defaultColor] || accentColors.purple;
  const gradient = PREVIEW_GRADIENTS[defaultColor] || PREVIEW_GRADIENTS.purple;

  // Get first 4 section types for preview
  const previewSections = sections.slice(0, 4).map(s => s.type);

  return (
    <button
      data-testid="template-card"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
        isSelected
          ? `${colors.border} shadow-lg ring-2 ring-offset-2 ring-purple-500`
          : `border-gray-200 dark:border-gray-700 ${cardBgColors.base} hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md`
      }`}
    >
      {/* Preview Thumbnail - Visual representation of template */}
      <div
        data-testid="template-preview"
        className={`relative h-32 bg-gradient-to-br ${gradient} p-3 ${defaultColor}`}
      >
        {/* Section layout preview - shows what sections the template has */}
        <div className="flex flex-wrap gap-1.5">
          {previewSections.map((sectionType, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 text-white text-xs font-medium backdrop-blur-sm"
            >
              <span>{SECTION_ICONS[sectionType] || '📦'}</span>
              <span className="hidden sm:inline">{sectionType}</span>
            </div>
          ))}
          {sections.length > 4 && (
            <div className="px-2 py-1 rounded-md bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
              +{sections.length - 4} more
            </div>
          )}
        </div>

        {/* Template type icon in corner */}
        <div
          data-testid="template-icon"
          className="absolute bottom-2 right-2 w-10 h-10 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center text-2xl"
        >
          {CATEGORY_INFO[metadata.category].icon}
        </div>

        {/* Featured badge - positioned in preview */}
        {metadata.featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-sm">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Card content */}
      <div className={`p-4 ${isSelected ? colors.bg : cardBgColors.base}`}>
        {/* Template name */}
        <h3
          data-testid="template-name"
          className="font-semibold text-gray-900 dark:text-gray-100 mb-1"
        >
          {metadata.name}
        </h3>

        {/* Description */}
        <p
          data-testid="template-description"
          className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3"
        >
          {metadata.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span>{CATEGORY_INFO[metadata.category].icon}</span>
            <span>{CATEGORY_INFO[metadata.category].label}</span>
          </span>

          <span className="flex items-center gap-2">
            {metadata.estimatedTime && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {metadata.estimatedTime} min
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span>{sections.length} sections</span>
          </span>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Selected
          </div>
        )}
      </div>
    </button>
  );
}

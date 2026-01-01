// ============================================================================
// Template Configuration - Centralized Metadata
// ============================================================================
// Single source of truth for category and color display info.
// Import this in any component that needs template metadata.
//
// DRY: This prevents duplication across TemplatePicker and PageWizard.
// ============================================================================

import type { TemplateCategory } from './types';
import type { AccentVariant } from '../colors';

// ============================================================================
// Category Metadata
// ============================================================================

export interface CategoryInfo {
  label: string;
  description: string;
  icon: string;
}

export const CATEGORY_INFO: Record<TemplateCategory, CategoryInfo> = {
  landing: { label: 'Landing Pages', description: 'Sales pages, launches, promotions', icon: '🚀' },
  course: { label: 'Courses', description: 'Online courses, training programs', icon: '📚' },
  shop: { label: 'Shop', description: 'Products, collections, e-commerce', icon: '🛒' },
  content: { label: 'Content', description: 'Blog, portfolio, about pages', icon: '📝' },
  utility: { label: 'Utility', description: 'Contact, thank you, simple pages', icon: '⚙️' },
};

export const ALL_CATEGORIES: TemplateCategory[] = ['landing', 'course', 'shop', 'content', 'utility'];

// ============================================================================
// Color Options for Wizard
// ============================================================================

export interface ColorOption {
  id: AccentVariant;
  label: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'purple', label: 'Purple' },
  { id: 'blue', label: 'Blue' },
  { id: 'teal', label: 'Teal' },
  { id: 'green', label: 'Green' },
  { id: 'gold', label: 'Gold' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category info by ID with fallback.
 */
export function getCategoryInfo(category: TemplateCategory): CategoryInfo {
  return CATEGORY_INFO[category] || CATEGORY_INFO.utility;
}

/**
 * Get color label by ID.
 */
export function getColorLabel(colorId: AccentVariant): string {
  const option = COLOR_OPTIONS.find((c) => c.id === colorId);
  return option?.label || colorId.charAt(0).toUpperCase() + colorId.slice(1);
}

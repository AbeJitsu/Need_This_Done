// ============================================================================
// Empty State Component - Friendly empty/no-results states
// ============================================================================
// Use when there's no content to display (empty cart, no search results, etc.)
// Provides helpful messaging and clear call-to-action.

import { headingColors, formInputColors } from '@/lib/colors';
import Button from '@/components/Button';
import type { AccentVariant } from '@/lib/colors';

interface EmptyStateProps {
  icon?: 'cart' | 'search' | 'inbox' | 'folder' | 'calendar' | 'custom';
  customIcon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionVariant?: AccentVariant;
  onAction?: () => void;
  className?: string;
}

const icons = {
  cart: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  inbox: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  folder: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  calendar: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  custom: null,
};

export default function EmptyState({
  icon = 'inbox',
  customIcon,
  title,
  description,
  actionLabel,
  actionHref,
  actionVariant = 'blue',
  onAction,
  className = '',
}: EmptyStateProps) {
  const IconComponent = icon === 'custom' ? customIcon : icons[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Icon */}
      <div className="text-gray-300 dark:text-gray-600 mb-6">
        {IconComponent}
      </div>

      {/* Title */}
      <h3 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`${formInputColors.helper} max-w-sm mb-6`}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {(actionLabel && actionHref) && (
        <Button variant={actionVariant} href={actionHref}>
          {actionLabel}
        </Button>
      )}
      {(actionLabel && onAction && !actionHref) && (
        <Button variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

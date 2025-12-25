import type { ReactNode } from 'react';
import {
  accentColors,
  solidButtonColors,
  cardBorderColors,
  cardBgColors,
  type AccentVariant,
} from './colors';

// ============================================================================
// Puck Shared Utilities - Built on colors.ts
// ============================================================================
// What: Puck-specific color utilities that extend the base color system
// Why: Single source of truth - change colors.ts, Puck updates automatically
// How: Re-export and extend base colors for Puck component needs

// ============================================================================
// Re-export base types for convenience
// ============================================================================
export type { AccentVariant };
export type PuckAccentColor = AccentVariant;

// ============================================================================
// Puck Color Utilities - Built from colors.ts
// ============================================================================
// These derive from the base color system so changes propagate automatically

/**
 * Get accent colors for a Puck component
 * Falls back to purple if color not found
 */
export function getPuckAccentColors(color: string) {
  const variant = color as AccentVariant;
  const base = accentColors[variant] || accentColors.purple;
  const solid = solidButtonColors[variant] || solidButtonColors.purple;

  return {
    // From accentColors
    bg: base.bg,
    text: base.text,
    border: base.border,
    hoverText: base.hoverText,
    hoverBorder: base.hoverBorder,
    // From solidButtonColors (for buttons, badges)
    bgSolid: `${solid.bg} ${solid.hover}`,
    textSolid: solid.text,
    // Derived utilities for Puck components
    iconBg: getIconBgClass(variant),
    lightBorder: getLightBorderClass(variant),
    starColor: getStarColorClass(variant),
    dotActive: getDotActiveClass(variant),
  };
}

// Helper functions for derived colors
function getIconBgClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'bg-purple-100 dark:bg-purple-900/40',
    blue: 'bg-blue-100 dark:bg-blue-900/40',
    green: 'bg-green-100 dark:bg-green-900/40',
    orange: 'bg-orange-100 dark:bg-orange-900/40',
    teal: 'bg-teal-100 dark:bg-teal-900/40',
    gray: 'bg-gray-100 dark:bg-gray-700',
    red: 'bg-red-100 dark:bg-red-900/40',
  };
  return map[color] || map.purple;
}

function getLightBorderClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'border-purple-200 dark:border-purple-800',
    blue: 'border-blue-200 dark:border-blue-800',
    green: 'border-green-200 dark:border-green-800',
    orange: 'border-orange-200 dark:border-orange-800',
    teal: 'border-teal-200 dark:border-teal-800',
    gray: 'border-gray-200 dark:border-gray-700',
    red: 'border-red-200 dark:border-red-800',
  };
  return map[color] || map.purple;
}

function getStarColorClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    teal: 'text-teal-500',
    gray: 'text-gray-500',
    red: 'text-red-500',
  };
  return map[color] || map.purple;
}

function getDotActiveClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    teal: 'bg-teal-600',
    gray: 'bg-gray-600',
    red: 'bg-red-600',
  };
  return map[color] || map.purple;
}

// ============================================================================
// Re-export card utilities from colors.ts
// ============================================================================
export const puckCardBg = cardBgColors.base;
export const puckCardBorder = cardBorderColors.light;

// ============================================================================
// Extended Puck Color Utilities
// ============================================================================
// Additional color getters for specific component needs

/**
 * Get quote icon colors (for testimonial quote marks)
 * Uses lighter shades for decorative quote icons
 */
function getQuoteColorClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'text-purple-300 dark:text-purple-700',
    blue: 'text-blue-300 dark:text-blue-700',
    green: 'text-green-300 dark:text-green-700',
    orange: 'text-orange-300 dark:text-orange-700',
    teal: 'text-teal-300 dark:text-teal-700',
    gray: 'text-gray-300 dark:text-gray-600',
    red: 'text-red-300 dark:text-red-700',
  };
  return map[color] || map.purple;
}

/**
 * Get card border with hover state (for testimonials, products)
 */
function getCardBorderHoverClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700',
    blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700',
    green: 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700',
    orange: 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700',
    teal: 'border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-700',
    gray: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    red: 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700',
  };
  return map[color] || map.purple;
}

/**
 * Get subtle background for cards/sections
 */
function getSubtleBgClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    teal: 'bg-teal-50 dark:bg-teal-900/20',
    gray: 'bg-gray-50 dark:bg-gray-800/50',
    red: 'bg-red-50 dark:bg-red-900/20',
  };
  return map[color] || map.purple;
}

/**
 * Get hover background for interactive elements
 */
function getHoverBgClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    blue: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    green: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    orange: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
    teal: 'hover:bg-teal-100 dark:hover:bg-teal-900/30',
    gray: 'hover:bg-gray-100 dark:hover:bg-gray-700/50',
    red: 'hover:bg-red-100 dark:hover:bg-red-900/30',
  };
  return map[color] || map.purple;
}

/**
 * Get text color for accent (600 light / 400 dark)
 */
function getAccentTextClass(color: AccentVariant): string {
  const map: Record<AccentVariant, string> = {
    purple: 'text-purple-600 dark:text-purple-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    teal: 'text-teal-600 dark:text-teal-400',
    gray: 'text-gray-600 dark:text-gray-400',
    red: 'text-red-600 dark:text-red-400',
  };
  return map[color] || map.purple;
}

/**
 * Get comprehensive Puck styling for a color
 * Extended version with all derived colors for Puck components
 */
export function getPuckFullColors(color: string) {
  const variant = color as AccentVariant;
  const base = getPuckAccentColors(color);
  const solid = solidButtonColors[variant] || solidButtonColors.purple;

  return {
    ...base,
    // Additional utilities
    quoteColor: getQuoteColorClass(variant),
    cardBorderHover: getCardBorderHoverClass(variant),
    subtleBg: getSubtleBgClass(variant),
    hoverBg: getHoverBgClass(variant),
    accentText: getAccentTextClass(variant),
    // Button utilities (combined for convenience)
    buttonBg: `${solid.bg} ${solid.hover}`,
    buttonText: solid.text,
    // Price text (same as accentText)
    priceText: getAccentTextClass(variant),
    // Product card hover border
    productHoverBorder: `hover:border-${variant === 'gray' ? 'gray' : variant}-400 dark:hover:border-${variant === 'gray' ? 'gray' : variant}-500`,
  };
}

// ============================================================================
// Layout Utilities - Grid columns and gaps
// ============================================================================

export const puckColumnsMap = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-2 lg:grid-cols-4',
} as const;

export const puckGapMap = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
} as const;

export const puckAspectMap = {
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-video',
} as const;

// ============================================================================
// Shared Icons - SVG icons used across multiple Puck components
// ============================================================================

export const puckIcons: Record<string, ReactNode> = {
  star: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  lightning: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  cog: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trophy: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  play: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  quote: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  ),
};

// ============================================================================
// Empty State Component
// ============================================================================

export function PuckEmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
      {icon && <div className="w-12 h-12 mx-auto text-gray-400 mb-3">{icon}</div>}
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

// ============================================================================
// Shared Color Utilities
// ============================================================================
// Centralized color class definitions used across cards and components.
// This keeps our styling consistent and avoids duplicating color schemes
// in multiple files.

export type AccentColor = 'purple' | 'blue' | 'green';
export type StepColor = 'purple' | 'blue' | 'green' | 'amber';

// ============================================================================
// Title Colors - Used for headings and labels
// ============================================================================
export const titleColors: Record<AccentColor, string> = {
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
};

// ============================================================================
// Border Colors - Top border accent for cards
// ============================================================================
export const topBorderColors: Record<AccentColor, string> = {
  purple: 'border-t-purple-500',
  blue: 'border-t-blue-500',
  green: 'border-t-green-500',
};

// ============================================================================
// Left Border Colors - Side accent for compact cards
// ============================================================================
export const leftBorderColors: Record<AccentColor, string> = {
  purple: 'border-l-purple-500 hover:border-l-purple-600',
  blue: 'border-l-blue-500 hover:border-l-blue-600',
  green: 'border-l-green-500 hover:border-l-green-600',
};

// ============================================================================
// Light Background Colors - Subtle accent backgrounds
// ============================================================================
export const lightBgColors: Record<AccentColor, string> = {
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
};

// ============================================================================
// Button Colors - CTA buttons with hover states
// ============================================================================
export const buttonColors: Record<AccentColor, string> = {
  purple: 'bg-purple-200 text-purple-700 border-2 border-purple-300 dark:bg-purple-500 dark:text-gray-900 dark:border-purple-100 hover:bg-purple-700 hover:text-white hover:border-purple-700 dark:hover:bg-purple-200 dark:hover:text-purple-800 dark:hover:border-purple-300 transition-all',
  blue: 'bg-blue-200 text-blue-700 border-2 border-blue-300 dark:bg-blue-500 dark:text-gray-900 dark:border-blue-100 hover:bg-blue-700 hover:text-white hover:border-blue-700 dark:hover:bg-blue-200 dark:hover:text-blue-800 dark:hover:border-blue-300 transition-all',
  green: 'bg-green-200 text-green-700 border-2 border-green-300 dark:bg-green-500 dark:text-gray-900 dark:border-green-100 hover:bg-green-700 hover:text-white hover:border-green-700 dark:hover:bg-green-200 dark:hover:text-green-800 dark:hover:border-green-300 transition-all',
};

// ============================================================================
// FAQ Colors - Numbered badge styling for FAQ items
// ============================================================================
export const faqColors: Record<AccentColor | 'amber', {
  border: string;
  text: string;
  bg: string;
  numText: string;
  hover: string;
}> = {
  purple: {
    border: 'border-l-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-100 dark:bg-purple-700',
    numText: 'text-purple-700 dark:text-white',
    hover: 'hover:border-purple-400 dark:hover:border-purple-400',
  },
  blue: {
    border: 'border-l-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-700',
    numText: 'text-blue-700 dark:text-white',
    hover: 'hover:border-blue-400 dark:hover:border-blue-400',
  },
  green: {
    border: 'border-l-green-500',
    text: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-700',
    numText: 'text-green-700 dark:text-white',
    hover: 'hover:border-green-400 dark:hover:border-green-400',
  },
  amber: {
    border: 'border-l-yellow-500',
    text: 'text-yellow-900 dark:text-yellow-200',
    bg: 'bg-yellow-100 dark:bg-yellow-700',
    numText: 'text-yellow-900 dark:text-white',
    hover: 'hover:border-yellow-400 dark:hover:border-yellow-400',
  },
};

// ============================================================================
// Step Colors - Numbered step cards (How It Works page)
// ============================================================================
// Includes amber for 4-step sequences
// Note: Amber uses dark text for 5:1+ contrast ratio
export const stepColors: Record<StepColor, {
  bg: string;
  ringBg: string;
  text: string;
  bullet: string;
  numberText: string;
}> = {
  purple: {
    bg: 'bg-purple-200 dark:bg-purple-700',
    ringBg: 'bg-purple-700 dark:bg-purple-200',
    text: 'text-purple-700 dark:text-purple-200',
    bullet: 'text-purple-700 dark:text-purple-200',
    numberText: 'text-purple-900 dark:text-white',
  },
  blue: {
    bg: 'bg-blue-200 dark:bg-blue-700',
    ringBg: 'bg-blue-700 dark:bg-blue-200',
    text: 'text-blue-700 dark:text-blue-200',
    bullet: 'text-blue-700 dark:text-blue-200',
    numberText: 'text-blue-900 dark:text-white',
  },
  green: {
    bg: 'bg-green-200 dark:bg-green-700',
    ringBg: 'bg-green-700 dark:bg-green-200',
    text: 'text-green-700 dark:text-green-200',
    bullet: 'text-green-700 dark:text-green-200',
    numberText: 'text-green-900 dark:text-white',
  },
  amber: {
    bg: 'bg-yellow-200 dark:bg-yellow-900',
    ringBg: 'bg-yellow-900 dark:bg-yellow-200',
    text: 'text-yellow-900 dark:text-yellow-200',
    bullet: 'text-yellow-900 dark:text-yellow-200',
    numberText: 'text-yellow-900 dark:text-white',
  },
};

// ============================================================================
// CTA Button Colors - Secondary navigation buttons (amber/teal/gray)
// ============================================================================
// Used for secondary CTAs across pages (FAQ, How It Works, etc.)
export type CtaColor = 'amber' | 'teal' | 'gray';

export const ctaColors: Record<CtaColor, string> = {
  amber: 'bg-amber-100 text-amber-900 border-2 border-amber-300 dark:bg-yellow-500 dark:text-gray-900 dark:border-yellow-100 hover:bg-amber-700 hover:text-white hover:border-amber-700 dark:hover:bg-yellow-200 dark:hover:text-yellow-900 dark:hover:border-yellow-300 transition-all',
  teal: 'bg-teal-100 text-teal-900 border-2 border-teal-300 dark:bg-teal-500 dark:text-gray-900 dark:border-teal-100 hover:bg-teal-700 hover:text-white hover:border-teal-700 dark:hover:bg-teal-200 dark:hover:text-teal-800 dark:hover:border-teal-300 transition-all',
  gray: 'bg-gray-200 text-gray-700 border-2 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 hover:bg-gray-700 hover:text-white hover:border-gray-700 dark:hover:bg-gray-200 dark:hover:text-gray-800 dark:hover:border-gray-300 transition-all',
};

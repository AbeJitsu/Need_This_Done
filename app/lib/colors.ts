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
  border: string;
  text: string;
  bullet: string;
  numberText: string;
}> = {
  purple: {
    bg: 'bg-purple-200 dark:bg-purple-700',
    border: 'border-purple-300 dark:border-purple-500',
    text: 'text-purple-700 dark:text-purple-200',
    bullet: 'text-purple-700 dark:text-purple-200',
    numberText: 'text-purple-900 dark:text-white',
  },
  blue: {
    bg: 'bg-blue-200 dark:bg-blue-700',
    border: 'border-blue-300 dark:border-blue-500',
    text: 'text-blue-700 dark:text-blue-200',
    bullet: 'text-blue-700 dark:text-blue-200',
    numberText: 'text-blue-900 dark:text-white',
  },
  green: {
    bg: 'bg-green-200 dark:bg-green-700',
    border: 'border-green-300 dark:border-green-500',
    text: 'text-green-700 dark:text-green-200',
    bullet: 'text-green-700 dark:text-green-200',
    numberText: 'text-green-900 dark:text-white',
  },
  amber: {
    bg: 'bg-yellow-200 dark:bg-yellow-700',
    border: 'border-yellow-300 dark:border-yellow-500',
    text: 'text-yellow-900 dark:text-yellow-200',
    bullet: 'text-yellow-900 dark:text-yellow-200',
    numberText: 'text-yellow-900 dark:text-white',
  },
};


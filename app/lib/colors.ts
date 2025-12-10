// ============================================================================
// Shared Color Utilities
// ============================================================================
// Centralized color class definitions used across cards and components.
// This keeps our styling consistent and avoids duplicating color schemes
// in multiple files.

export type AccentColor = 'purple' | 'blue' | 'green';
export type AccentVariant = 'purple' | 'blue' | 'green' | 'orange' | 'teal' | 'gray' | 'red';

// ============================================================================
// Accent Colors - Shared styling for Button and CircleBadge
// ============================================================================
// Dark text on light background - works in both light and dark modes
// Used by components with bg-100 backgrounds (Button, CircleBadge)
// bg-100, text-700/800, border-500/400
export const accentColors: Record<AccentVariant, {
  bg: string;
  text: string;
  border: string;
}> = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500 dark:border-purple-400' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500 dark:border-blue-400' },
  green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500 dark:border-green-400' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500 dark:border-orange-400' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-500 dark:border-teal-400' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500 dark:border-gray-400' },
  red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-700 dark:border-red-300' },
};

// ============================================================================
// Title Colors - Used for headings and labels (generic)
// ============================================================================
// Updated to meet WCAG AA (5:1 contrast) in dark mode
export const titleColors: Record<AccentColor, string> = {
  purple: 'text-purple-600 dark:text-purple-300',
  blue: 'text-blue-600 dark:text-blue-300',
  green: 'text-green-600 dark:text-green-300',
};

// ============================================================================
// Title Text Colors - For StepCard titles on dark backgrounds
// ============================================================================
// Light mode: dark text (700/800) for readability on white cards
// Dark mode: light text (100) for readability on dark gray cards
// Matches CircleBadge number colors for visual cohesion
export const titleTextColors: Record<AccentVariant, string> = {
  purple: 'text-purple-700 dark:text-purple-100',
  blue: 'text-blue-700 dark:text-blue-100',
  green: 'text-green-800 dark:text-green-100',
  orange: 'text-orange-800 dark:text-orange-100',
  teal: 'text-teal-800 dark:text-teal-100',
  gray: 'text-gray-700 dark:text-gray-100',
  red: 'text-red-800 dark:text-red-100',
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
// Status Border Colors - Left border accent based on project status
// ============================================================================
// Used by ProjectCard to show status-matched colored left border
export const statusBorderColors: Record<AccentVariant, string> = {
  purple: 'border-l-4 border-l-purple-500',
  blue: 'border-l-4 border-l-blue-500',
  green: 'border-l-4 border-l-green-500',
  orange: 'border-l-4 border-l-orange-500',
  teal: 'border-l-4 border-l-teal-500',
  gray: 'border-l-4 border-l-gray-400',
  red: 'border-l-4 border-l-red-500',
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
// Checkmark Colors - High contrast icons for feature lists (5:1 ratio)
// ============================================================================
// Uses -100 bg with -700/-800 text in both modes for maximum contrast
export const checkmarkColors: Record<AccentColor, {
  bg: string;
  icon: string;
}> = {
  purple: { bg: 'bg-purple-100', icon: 'text-purple-700' },
  blue: { bg: 'bg-blue-100', icon: 'text-blue-700' },
  green: { bg: 'bg-green-100', icon: 'text-green-800' },
};

// ============================================================================
// Card Hover Colors - For Card component hover states
// ============================================================================
// Centralized hover border colors for cards with color accents
export const cardHoverColors: Record<AccentVariant, string> = {
  purple: 'hover:border-purple-400 dark:hover:border-purple-500',
  blue: 'hover:border-blue-400 dark:hover:border-blue-500',
  green: 'hover:border-green-400 dark:hover:border-green-500',
  orange: 'hover:border-orange-400 dark:hover:border-orange-500',
  teal: 'hover:border-teal-400 dark:hover:border-teal-500',
  gray: 'hover:border-gray-400 dark:hover:border-gray-500',
  red: 'hover:border-red-400 dark:hover:border-red-500',
};

// ============================================================================
// Card Hover Background Tints - Subtle background on hover
// ============================================================================
export const cardHoverBgTints: Record<AccentVariant, string> = {
  purple: 'hover:bg-purple-50/30 dark:hover:bg-purple-900/10',
  blue: 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10',
  green: 'hover:bg-green-50/30 dark:hover:bg-green-900/10',
  orange: 'hover:bg-orange-50/30 dark:hover:bg-orange-900/10',
  teal: 'hover:bg-teal-50/30 dark:hover:bg-teal-900/10',
  gray: 'hover:bg-gray-50/30 dark:hover:bg-gray-900/10',
  red: 'hover:bg-red-50/30 dark:hover:bg-red-900/10',
};

// ============================================================================
// Tag Hover Colors - Hover effects for service/status tags
// ============================================================================
// Makes tags feel interactive with color-matched hover states
export const tagHoverColors: Record<AccentVariant, string> = {
  purple: 'hover:bg-purple-200 hover:border-purple-600 dark:hover:bg-purple-800 dark:hover:border-purple-300',
  blue: 'hover:bg-blue-200 hover:border-blue-600 dark:hover:bg-blue-800 dark:hover:border-blue-300',
  green: 'hover:bg-green-200 hover:border-green-600 dark:hover:bg-green-800 dark:hover:border-green-300',
  orange: 'hover:bg-orange-200 hover:border-orange-600 dark:hover:bg-orange-800 dark:hover:border-orange-300',
  teal: 'hover:bg-teal-200 hover:border-teal-600 dark:hover:bg-teal-800 dark:hover:border-teal-300',
  gray: 'hover:bg-gray-200 hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-300',
  red: 'hover:bg-red-200 hover:border-red-600 dark:hover:bg-red-800 dark:hover:border-red-300',
};

// ============================================================================
// Body Text Colors - For card descriptions and bullet points
// ============================================================================
// Light mode: gray-600 for all (readable on white)
// Dark mode: color-matched 100 shade for visual cohesion with CircleBadge
export const bodyTextColors: Record<AccentVariant, string> = {
  purple: 'text-gray-600 dark:text-purple-100',
  blue: 'text-gray-600 dark:text-blue-100',
  green: 'text-gray-600 dark:text-green-100',
  orange: 'text-gray-600 dark:text-orange-100',
  teal: 'text-gray-600 dark:text-teal-100',
  gray: 'text-gray-600 dark:text-gray-100',
  red: 'text-gray-600 dark:text-red-100',
};

// ============================================================================
// FAQ Colors - Numbered badge styling for FAQ items
// ============================================================================
// Uses AccentVariant subset for FAQ card left borders and text colors
export const faqColors: Record<'purple' | 'blue' | 'green' | 'orange', {
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
  orange: {
    border: 'border-l-orange-500',
    text: 'text-orange-800 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-700',
    numText: 'text-orange-800 dark:text-white',
    hover: 'hover:border-orange-400 dark:hover:border-orange-400',
  },
};

// ============================================================================
// Feature Card Colors - Styling for FeatureCard component variants
// ============================================================================
// Maps variant names to accent colors for consistent theming
export type FeatureCardVariant = 'default' | 'primary' | 'success';

export const featureCardColors: Record<FeatureCardVariant, {
  container: string;
  icon: string;
  hover: string;
}> = {
  default: {
    container: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
    icon: 'text-gray-700 dark:text-gray-300',
    hover: 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg',
  },
  primary: {
    container: 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-gray-700',
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20',
  },
  success: {
    container: 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-gray-700',
    icon: 'text-green-600 dark:text-green-400',
    hover: 'hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-green-500/20',
  },
};

// ============================================================================
// Form Input Colors - Styling for text inputs, textareas, and selects
// ============================================================================
// Provides consistent, accessible styling for all form elements
// Placeholder text meets WCAG contrast requirements in both modes
export const formInputColors = {
  // Base input styling
  base: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
  // Placeholder text - subtle but readable
  placeholder: 'placeholder:text-gray-600 dark:placeholder:text-gray-400',
  // Focus state
  focus: 'focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
  // Helper text below inputs - 5:1 contrast in both modes
  helper: 'text-gray-600 dark:text-gray-300',
  // Label text - 5:1 contrast in both modes
  label: 'text-gray-700 dark:text-gray-100',
};

// ============================================================================
// Form Validation Colors - Error and success messaging
// ============================================================================
// High contrast colors for validation feedback - meets WCAG AA (5:1) in both modes
export const formValidationColors = {
  // Error message styling - matches accentColors.red pattern
  error: 'text-red-800 dark:text-red-100',
  // Success message styling - high contrast green
  success: 'text-green-800 dark:text-green-100',
  // Warning message styling - high contrast orange
  warning: 'text-orange-800 dark:text-orange-100',
  // Info message styling - high contrast blue
  info: 'text-blue-800 dark:text-blue-100',
};

// ============================================================================
// Navigation Colors - Styling for navigation links and elements
// ============================================================================
// Consistent, accessible colors for all navigation elements - meets WCAG AA (5:1)
export const navigationColors = {
  // Non-active navigation links - readable but not too prominent
  link: 'text-gray-600 dark:text-gray-300',
  // Hover state for navigation links
  linkHover: 'hover:text-gray-900 dark:hover:text-gray-200',
  // Sign in link - subtle but accessible
  signIn: 'text-gray-600 dark:text-gray-300',
  // Sign in hover state
  signInHover: 'hover:text-gray-800 dark:hover:text-gray-100',
  // Dropdown helper text (e.g., "Signed in as")
  dropdownHelper: 'text-gray-500 dark:text-gray-300',
  // User menu button text
  userButton: 'text-gray-500 dark:text-gray-300',
  // User menu button hover
  userButtonHover: 'hover:text-gray-700 dark:hover:text-gray-200',
};

// ============================================================================
// Step Badge Colors - Numbered badges for multi-step processes
// ============================================================================
// Used for numbered step indicators in process explanations and forms
export const stepBadgeColors: Record<AccentVariant, string> = {
  purple: 'text-purple-700 dark:text-purple-300',
  blue: 'text-blue-700 dark:text-blue-300',
  green: 'text-green-700 dark:text-green-300',
  orange: 'text-orange-700 dark:text-orange-300',
  teal: 'text-teal-700 dark:text-teal-300',
  gray: 'text-gray-700 dark:text-gray-300',
  red: 'text-red-700 dark:text-red-300',
};

// ============================================================================
// Success Checkmark Colors - For checkmarks in feature lists and success states
// ============================================================================
export const successCheckmarkColors = {
  icon: 'text-green-600 dark:text-green-300',
  iconAlt: 'text-green-600 dark:text-green-700', // Alternative used in services page
};

// ============================================================================
// Danger/Destructive Action Colors - For delete, remove, cancel actions
// ============================================================================
export const dangerColors = {
  text: 'text-red-500 dark:text-red-300',
  hover: 'hover:text-red-600 dark:hover:text-red-400',
  hoverStrong: 'hover:text-red-700 dark:hover:text-red-100',
};

// ============================================================================
// Muted Text Colors - For very subtle secondary text
// ============================================================================
export const mutedTextColors = {
  normal: 'text-gray-400 dark:text-gray-500',
  light: 'text-gray-500 dark:text-gray-300',
};

// ============================================================================
// Heading Text Colors - Standard heading colors (non-accented)
// ============================================================================
export const headingColors = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-700 dark:text-gray-300',
};

// ============================================================================
// Link Colors - For text links
// ============================================================================
export const linkColors = {
  blue: 'text-blue-600 dark:text-blue-400',
};

// ============================================================================
// Link Hover Colors - For blue link hover states
// ============================================================================
export const linkHoverColors = {
  blue: 'hover:text-blue-700 dark:hover:text-blue-300',
};



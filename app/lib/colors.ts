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
  hoverBorder: string;
}> = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500 dark:border-purple-400', hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-400' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500 dark:border-blue-400', hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400' },
  green: { bg: 'bg-green-100', text: 'text-green-700 dark:text-green-300', border: 'border-green-500 dark:border-green-400', hoverBorder: 'hover:border-green-500 dark:hover:border-green-400' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500 dark:border-orange-400', hoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-500 dark:border-teal-400', hoverBorder: 'hover:border-teal-500 dark:hover:border-teal-400' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-500 dark:border-gray-400', hoverBorder: 'hover:border-gray-500 dark:hover:border-gray-400' },
  red: { bg: 'bg-red-100', text: 'text-red-700 dark:text-red-300', border: 'border-red-700 dark:border-red-300', hoverBorder: 'hover:border-red-700 dark:hover:border-red-300' },
};

// ============================================================================
// Title Colors - Used for headings and labels (generic)
// ============================================================================
// Updated to meet WCAG AA (4.5:1 contrast) for normal text in both modes
// Light mode: -700 shades ensure 4.5:1+ contrast on white
// Dark mode: -300 shades ensure 4.5:1+ contrast on gray-800
export const titleColors: Record<AccentColor, string> = {
  purple: 'text-purple-700 dark:text-purple-300',
  blue: 'text-blue-700 dark:text-blue-300',
  green: 'text-green-700 dark:text-green-300',
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
// Light mode: -100 shades (light pastel backgrounds with dark text)
// Dark mode: -800 shades (solid dark backgrounds for WCAG AA contrast with light text)
export const lightBgColors: Record<AccentColor, string> = {
  purple: 'bg-purple-100 dark:bg-purple-800',
  blue: 'bg-blue-100 dark:bg-blue-800',
  green: 'bg-green-100 dark:bg-green-800',
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

// ============================================================================
// Group Hover Colors - For elements that change on parent hover
// ============================================================================
// Used for text that changes color when a parent with group class is hovered
export const groupHoverColors = {
  blue: 'group-hover:text-blue-600 dark:group-hover:text-blue-300',
  purple: 'group-hover:text-purple-600 dark:group-hover:text-purple-300',
  orange: 'group-hover:text-orange-600 dark:group-hover:text-orange-300',
};

// ============================================================================
// Alert Colors - Notification and message box styling
// ============================================================================
// Consistent backgrounds and borders for info, error, success, warning alerts
export const alertColors = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border border-blue-200 dark:border-blue-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border border-red-200 dark:border-red-800',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border border-green-200 dark:border-green-800',
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border border-orange-200 dark:border-orange-800',
  },
};

// ============================================================================
// Divider Colors - For horizontal/vertical separators
// ============================================================================
export const dividerColors = {
  subtle: 'bg-gray-300 dark:bg-gray-600',
  border: 'border-gray-200 dark:border-gray-700',
};

// ============================================================================
// Footer Colors - For site-wide footer
// ============================================================================
export const footerColors = {
  bg: 'bg-white dark:bg-gray-900',
  border: 'border-t border-gray-200 dark:border-gray-800',
};

// ============================================================================
// Placeholder Colors - For image placeholders and empty states
// ============================================================================
export const placeholderColors = {
  bg: 'bg-gray-200 dark:bg-gray-700',
};

// ============================================================================
// Checkmark Background Colors - For circular checkmark containers
// ============================================================================
export const checkmarkBgColors: Record<'green' | 'blue' | 'purple', string> = {
  green: 'bg-green-100 dark:bg-green-200',
  blue: 'bg-blue-100 dark:bg-blue-200',
  purple: 'bg-purple-100 dark:bg-purple-200',
};

// ============================================================================
// Card Background Colors - For card containers
// ============================================================================
export const cardBgColors = {
  base: 'bg-white dark:bg-gray-800',
  elevated: 'bg-gray-50 dark:bg-gray-700',
  interactive: 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
};

// ============================================================================
// Card Border Colors - For card container borders
// ============================================================================
export const cardBorderColors = {
  subtle: 'border-2 border-gray-400 dark:border-gray-500',
  light: 'border border-gray-200 dark:border-gray-700',
  lightMd: 'border-2 border-gray-300 dark:border-gray-600',
};

// ============================================================================
// Primary Button Colors - For primary action buttons
// ============================================================================
export const primaryButtonColors = {
  bg: 'bg-blue-600 dark:bg-blue-500',
  hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
  text: 'text-white',
  focus: 'focus:ring-2 focus:ring-blue-500',
};

// ============================================================================
// Icon Button Colors - For icon-only buttons in headers and toolbars
// ============================================================================
export const iconButtonColors = {
  text: 'text-gray-500 dark:text-gray-400',
  hover: 'hover:text-gray-700 dark:hover:text-gray-200',
  bg: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  secondary: {
    bg: 'bg-gray-200 dark:bg-gray-700',
    hover: 'hover:bg-gray-300 dark:hover:bg-gray-600',
    text: 'text-gray-600 dark:text-gray-300',
  },
};

// ============================================================================
// Loading Indicator Colors - For loading spinners and dots
// ============================================================================
export const loadingColors = {
  bg: 'bg-gray-100 dark:bg-gray-700',
  dot: 'bg-gray-400',
};

// ============================================================================
// Status Badge Colors - For appointment/order status indicators
// ============================================================================
// Consistent styling for status badges across admin pages
export const statusBadgeColors = {
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-100',
    border: 'border border-yellow-200 dark:border-yellow-800',
  },
  approved: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border border-blue-200 dark:border-blue-800',
  },
  confirmed: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-800',
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-800',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-100',
    border: 'border border-red-200 dark:border-red-800',
  },
  rejected: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-100',
    border: 'border border-red-200 dark:border-red-800',
  },
  paid: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-800',
  },
  unpaid: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-100',
    border: 'border border-gray-200 dark:border-gray-600',
  },
  refunded: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-800 dark:text-purple-100',
    border: 'border border-purple-200 dark:border-purple-800',
  },
};

// ============================================================================
// File Upload Colors - For file upload dropzones
// ============================================================================
export const fileUploadColors = {
  border: 'border-2 border-dashed border-gray-300 dark:border-gray-600',
  hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
  bg: 'bg-gray-50 dark:bg-gray-800',
  hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700',
};

// ============================================================================
// Navigation Background Colors - For navigation bar
// ============================================================================
export const navigationBgColors = {
  base: 'bg-white dark:bg-gray-900',
  border: 'border-b border-gray-200 dark:border-gray-800',
  dropdown: 'bg-white dark:bg-gray-800',
  dropdownBorder: 'border border-gray-200 dark:border-gray-700',
  dropdownHover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
};

// ============================================================================
// Layout Background Colors - For page sections and containers
// ============================================================================
export const layoutBgColors = {
  page: 'bg-white dark:bg-gray-900',
  section: 'bg-gray-50 dark:bg-gray-800',
  gradient: 'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
};


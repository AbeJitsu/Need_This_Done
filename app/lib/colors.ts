// ============================================================================
// Shared Color Utilities - Last verified: Dec 2025
// ============================================================================
// Centralized color class definitions used across cards and components.
// This keeps our styling consistent and avoids duplicating color schemes
// in multiple files.
//
// ============================================================================
// HOW TO USE THIS FILE
// ============================================================================
//
// THE CORE PATTERN (memorize this):
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  LIGHT MODE              │  DARK MODE                                   │
// ├─────────────────────────────────────────────────────────────────────────┤
// │  Background: -100        │  Background: -500 (vibrant)                  │
// │  Text: -700 or -800      │  Text: -100 (light)                          │
// │  Border: -500            │  Border: -200 or -300                        │
// └─────────────────────────────────────────────────────────────────────────┘
//
// QUICK REFERENCE:
//   bg:     'bg-purple-100 dark:bg-purple-500'
//   text:   'text-purple-700 dark:text-purple-100'
//   border: 'border-purple-500 dark:border-purple-200'
//
// WHEN TO USE EACH SHADE:
//   -50:  Very subtle backgrounds (light mode only)
//   -100: Standard light backgrounds (light mode)
//   -200: Light borders
//   -300: Darker borders (dark mode)
//   -500: Vibrant backgrounds (dark mode) + medium borders (light mode)
//   -700: Dark text (light mode)
//   -800: Darker text (light mode, for green/red)
//   -100: Light text (dark mode)
//
// ADDING NEW COLORS:
//   1. Follow the pattern above for light/dark mode
//   2. Use AccentVariant type for new color keys
//   3. Test in both light and dark mode
//   4. Ensure WCAG AA contrast (4.5:1 for text, 3:1 for large text)
//
// EXISTING EXPORTS TO REUSE:
//   - accentColors: Full button/badge styling (bg, text, border, hover)
//   - titleTextColors: Colored headings
//   - headingColors: Gray headings (primary/secondary)
//   - formInputColors: Form field styling
//   - cardBgColors: Card backgrounds
//   - cardBorderColors: Card borders
//
// ============================================================================

export type AccentColor = 'purple' | 'blue' | 'green';
export type AccentVariant = 'purple' | 'blue' | 'green' | 'orange' | 'teal' | 'gray' | 'red';

// ============================================================================
// Shadow Classes - Centralized shadow utilities
// ============================================================================
// Consistent shadow patterns for cards, modals, and interactive elements.
// Use these instead of hardcoding shadow values throughout the codebase.
export const shadowClasses = {
  // Subtle shadow for cards at rest
  card: 'shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_0px_rgba(255,255,255,0.05)]',
  // Elevated shadow for cards on hover
  cardHover: 'hover:shadow-[0_0_16px_0px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_16px_0px_rgba(255,255,255,0.1)]',
  // Lift effect for interactive cards
  lift: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  // Large shadow for modals and overlays
  modal: 'shadow-2xl',
  // Small shadow for navigation elements
  nav: 'shadow-sm',
  // Medium shadow for dropdowns
  dropdown: 'shadow-lg',
};

// ============================================================================
// Focus Ring Classes - Consistent focus states for accessibility
// ============================================================================
// Use these for keyboard navigation visibility.
export const focusRingClasses = {
  blue: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
  purple: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
  orange: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
  green: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
};

// ============================================================================
// Accent Colors - Unified styling for Button, CircleBadge, and Navigation
// ============================================================================
// Single source of truth for all accent-colored interactive elements.
// Light mode: Light bg (-100), dark text (-700/800), medium border (-500)
// Dark mode: Vibrant bg (-500), dark text (gray-900) for 5:1+ contrast
//
// Usage: Import and spread in className, e.g.:
//   ${accentColors.orange.bg} ${accentColors.orange.text} ${accentColors.orange.border}

export const accentColors: Record<AccentVariant, {
  bg: string;
  text: string;
  border: string;
  hoverText: string;
  hoverBorder: string;
}> = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    text: 'text-purple-700 dark:text-white',
    border: 'border-purple-500 dark:border-purple-400',
    hoverText: 'hover:text-purple-800 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-purple-600 dark:hover:border-purple-300',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    text: 'text-blue-700 dark:text-white',
    border: 'border-blue-500 dark:border-blue-400',
    hoverText: 'hover:text-blue-800 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-blue-600 dark:hover:border-blue-300',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-white',
    border: 'border-green-500 dark:border-green-400',
    hoverText: 'hover:text-green-900 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-green-600 dark:hover:border-green-300',
  },
  orange: {
    // Dark mode uses saturated orange (#ad5700) for true orange look
    // #ad5700 = H:30° S:100% L:34%, 5.07:1 contrast (closer to 5:1, more orange)
    bg: 'bg-orange-100 dark:bg-[#ad5700]',
    text: 'text-orange-900 dark:text-white',
    border: 'border-orange-500 dark:border-orange-400',
    hoverText: 'hover:text-orange-950 dark:hover:text-orange-100',
    hoverBorder: 'hover:border-orange-600 dark:hover:border-orange-300',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-800',
    text: 'text-teal-900 dark:text-white',
    border: 'border-teal-500 dark:border-teal-400',
    hoverText: 'hover:text-teal-950 dark:hover:text-teal-100',
    hoverBorder: 'hover:border-teal-600 dark:hover:border-teal-300',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-white',
    border: 'border-gray-500 dark:border-gray-400',
    hoverText: 'hover:text-gray-800 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-gray-600 dark:hover:border-gray-300',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-800',
    text: 'text-red-800 dark:text-white',
    border: 'border-red-500 dark:border-red-400',
    hoverText: 'hover:text-red-900 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-red-600 dark:hover:border-red-300',
  },
};

// Border width constant - change once to update all buttons/badges globally
export const accentBorderWidth = 'border-2';

// Font weight constant - change once to update all buttons/badges globally
export const accentFontWeight = 'font-semibold';

// Link font weight - slightly lighter than buttons for text links
export const linkFontWeight = 'font-medium';

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
  orange: 'text-orange-600 dark:text-orange-100',
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
  purple: 'border-l-purple-500 dark:border-l-purple-400 hover:border-l-purple-600 dark:hover:border-l-purple-300',
  blue: 'border-l-blue-500 dark:border-l-blue-400 hover:border-l-blue-600 dark:hover:border-l-blue-300',
  green: 'border-l-green-500 dark:border-l-green-400 hover:border-l-green-600 dark:hover:border-l-green-300',
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
  gray: 'border-l-4 border-l-gray-300 dark:border-l-gray-600',
  red: 'border-l-4 border-l-red-500 dark:border-l-red-400',
};

// ============================================================================
// Light Background Colors - Subtle accent backgrounds
// ============================================================================
// Uses the same proven accentColors pattern that works perfectly for buttons
// Light mode: -100 shades (light pastel backgrounds)
// Dark mode: -500 shades (vibrant, highly visible backgrounds)
export const lightBgColors: Record<AccentColor, string> = {
  purple: 'bg-purple-100 dark:bg-purple-500',
  blue: 'bg-blue-100 dark:bg-blue-500',
  green: 'bg-green-100 dark:bg-green-500',
};

// ============================================================================
// Checkmark Colors - High contrast icons for feature lists (5:1 ratio)
// ============================================================================
// Uses -100 bg with -700/-800 text in both modes for maximum contrast
export const checkmarkColors: Record<AccentColor, {
  bg: string;
  icon: string;
}> = {
  purple: { bg: 'bg-purple-100 dark:bg-purple-800', icon: 'text-purple-700 dark:text-purple-300' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-800', icon: 'text-blue-700 dark:text-blue-300' },
  green: { bg: 'bg-green-100 dark:bg-green-800', icon: 'text-green-700 dark:text-green-300' },
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
    // #c76500 for lighter backgrounds, H:30° S:100% L:39%, brighter variant
    bg: 'bg-orange-100 dark:bg-[#c76500]',
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
  // Error message styling - white text in dark mode for contrast against vibrant bg-red-500
  error: 'text-red-800 dark:text-white',
  // Success message styling - white text in dark mode for contrast against vibrant bg-green-500
  success: 'text-green-800 dark:text-white',
  // Warning message styling - white text in dark mode for contrast against vibrant bg-orange-500
  warning: 'text-orange-800 dark:text-white',
  // Info message styling - white text in dark mode for contrast against vibrant bg-blue-500
  info: 'text-blue-800 dark:text-white',
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
  iconAlt: 'text-green-700 dark:text-green-100', // For vibrant bg circles - matches accent system
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
// Light mode: -600 ensures WCAG AA contrast (4.5:1) on white backgrounds
// Dark mode: -300 ensures 7:1+ contrast on gray-800 backgrounds
export const mutedTextColors = {
  normal: 'text-gray-500 dark:text-gray-300',
  light: 'text-gray-600 dark:text-gray-300',
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
// Light mode: -50 shades (very light backgrounds) with -800 text
// Dark mode: -800 shades (solid backgrounds) with white text for 6-9:1 contrast
// Border: 2px width, -400 in dark mode for visibility against -800 backgrounds
export const alertColors = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-800',
    border: 'border-2 border-blue-200 dark:border-blue-400',
    text: 'text-blue-800 dark:text-white',
    link: 'text-blue-700 dark:text-white underline hover:text-blue-900 dark:hover:text-gray-200',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-800',
    border: 'border-2 border-red-200 dark:border-red-400',
    text: 'text-red-800 dark:text-white',
    link: 'text-red-700 dark:text-white underline hover:text-red-900 dark:hover:text-gray-200',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-800',
    border: 'border-2 border-green-200 dark:border-green-400',
    text: 'text-green-800 dark:text-white',
    link: 'text-green-700 dark:text-white underline hover:text-green-900 dark:hover:text-gray-200',
  },
  warning: {
    // Dark mode uses #ad5700 (5.07:1 contrast) for true orange look
    bg: 'bg-orange-50 dark:bg-[#ad5700]',
    border: 'border-2 border-orange-200 dark:border-orange-400',
    text: 'text-orange-800 dark:text-white',
    link: 'text-orange-700 dark:text-white underline hover:text-orange-900 dark:hover:text-gray-200',
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
// Matches accentColors pattern: light bg (-100) + dark text in light mode,
// vibrant bg (-500) + light text + light border in dark mode
export const checkmarkBgColors: Record<'green' | 'blue' | 'purple', {
  bg: string;
  border: string;
  icon: string;
}> = {
  green: {
    bg: 'bg-green-100 dark:bg-green-500',
    border: 'border-2 border-green-500 dark:border-green-200',
    icon: 'text-green-800 dark:text-green-100',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    border: 'border-2 border-blue-500 dark:border-blue-200',
    icon: 'text-blue-700 dark:text-blue-100',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    border: 'border-2 border-purple-500 dark:border-purple-200',
    icon: 'text-purple-700 dark:text-purple-100',
  },
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
  // Appointment/general statuses
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-100',
    border: 'border border-yellow-200 dark:border-yellow-700',
  },
  approved: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border border-blue-200 dark:border-blue-700',
  },
  confirmed: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-800',
    text: 'text-red-800 dark:text-red-100',
    border: 'border border-red-200 dark:border-red-700',
  },
  rejected: {
    bg: 'bg-red-100 dark:bg-red-800',
    text: 'text-red-800 dark:text-red-100',
    border: 'border border-red-200 dark:border-red-700',
  },
  paid: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  unpaid: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-100',
    border: 'border border-gray-200 dark:border-gray-600',
  },
  refunded: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    text: 'text-purple-800 dark:text-purple-100',
    border: 'border border-purple-200 dark:border-purple-700',
  },
  // Order-specific statuses
  delivered: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  shipped: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border border-blue-200 dark:border-blue-700',
  },
  processing: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    text: 'text-purple-800 dark:text-purple-100',
    border: 'border border-purple-200 dark:border-purple-700',
  },
  // Appointment-specific statuses
  modified: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border border-blue-200 dark:border-blue-700',
  },
  // User role/status badges
  admin: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    text: 'text-purple-800 dark:text-purple-100',
    border: 'border border-purple-200 dark:border-purple-700',
  },
  user: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-100',
    border: 'border border-gray-200 dark:border-gray-600',
  },
  active: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  disabled: {
    bg: 'bg-red-100 dark:bg-red-800',
    text: 'text-red-800 dark:text-red-100',
    border: 'border border-red-200 dark:border-red-700',
  },
  // Page/content statuses
  published: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-700 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  draft: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border border-gray-200 dark:border-gray-600',
  },
  customized: {
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'text-green-800 dark:text-green-100',
    border: 'border border-green-200 dark:border-green-700',
  },
  default: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border border-gray-200 dark:border-gray-600',
  },
};

// ============================================================================
// Category Badge Colors - For changelog and content categorization
// ============================================================================
// Consistent styling for category badges across pages
// Category badges: -800 backgrounds with white text in dark mode for 6-9:1 contrast
export const categoryBadgeColors: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-white',
  Shop: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-white',
  Dashboard: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white',
  Public: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
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

// ============================================================================
// Gradient Colors - For decorative gradients across the site
// ============================================================================
// Centralized gradient definitions to maintain consistency
export const gradientColors = {
  // Page background gradient for Puck pages
  pageBackground: 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900',
  // Popular badge gradient
  popularBadge: 'bg-gradient-to-r from-blue-500 to-blue-600',
  // Avatar placeholder gradient
  avatarPlaceholder: 'bg-gradient-to-br from-purple-400 to-blue-500',
};

// ============================================================================
// Solid Button Colors - For solid background action buttons
// ============================================================================
// All accent color variants with background, hover, text, and focus ring states
// Light mode: -600 shade for backgrounds, -700 on hover
// Dark mode: -600 shade for backgrounds (same as light for 4.5:1+ contrast with white)
export const solidButtonColors: Record<AccentVariant, {
  bg: string;
  hover: string;
  text: string;
  focus: string;
}> = {
  purple: {
    bg: 'bg-purple-600 dark:bg-purple-600',
    hover: 'hover:bg-purple-700 dark:hover:bg-purple-700',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-purple-500',
  },
  blue: {
    bg: 'bg-blue-600 dark:bg-blue-600',
    hover: 'hover:bg-blue-700 dark:hover:bg-blue-700',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-blue-500',
  },
  green: {
    bg: 'bg-green-600 dark:bg-green-600',
    hover: 'hover:bg-green-700 dark:hover:bg-green-700',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-green-500',
  },
  orange: {
    // Dark mode uses saturated orange (#ad5700) for true orange appearance
    // #ad5700 = H:30° S:100% L:34% with 5.07:1 contrast (closer to 5:1, more orange hue)
    bg: 'bg-orange-600 dark:bg-[#ad5700]',
    hover: 'hover:bg-orange-700 dark:hover:bg-[#954a00]',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-orange-500',
  },
  teal: {
    bg: 'bg-teal-600 dark:bg-teal-600',
    hover: 'hover:bg-teal-700 dark:hover:bg-teal-700',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-teal-500',
  },
  gray: {
    bg: 'bg-gray-600 dark:bg-gray-600',
    hover: 'hover:bg-gray-700 dark:hover:bg-gray-700',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-gray-500',
  },
  red: {
    bg: 'bg-red-600 dark:bg-red-600',
    hover: 'hover:bg-red-700 dark:hover:bg-red-700',
    text: 'text-white',
    focus: 'focus:ring-2 focus:ring-red-500',
  },
};

// ============================================================================
// Filter Button Colors - For admin filter toggle buttons
// ============================================================================
// Separate active and inactive states for filter buttons
// Active colors: purple, green, red for different filter types
// Inactive: gray styling with hover effect
export const filterButtonColors = {
  active: {
    purple: 'bg-purple-600 dark:bg-purple-500 text-white',
    green: 'bg-green-600 dark:bg-green-500 text-white',
    red: 'bg-red-600 dark:bg-red-500 text-white',
  },
  inactive: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
};

// ============================================================================
// Badge Colors - For notification badges and counts
// ============================================================================
// Simple, bold styling for notification badges and cart counts
// All accent color variants with vibrant backgrounds and white text
export const badgeColors: Record<AccentVariant, string> = {
  purple: 'bg-purple-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white',
  teal: 'bg-teal-500 text-white',
  gray: 'bg-gray-500 text-white',
  red: 'bg-red-600 text-white',
};

// ============================================================================
// Product Image Filters - Consistent styling for product photos
// ============================================================================
// Using inline styles because Tailwind arbitrary values don't work with dynamic imports
export const productImageStyles = {
  filter: 'saturate(0.85) contrast(0.65)',
};

// ============================================================================
// Admin Sidebar Colors - Navigation for admin sections
// ============================================================================
// Used by AdminSidebar component for consistent admin navigation styling
export const adminSidebarColors = {
  // Sidebar container
  bg: 'bg-white dark:bg-gray-800',
  border: 'border-r border-gray-200 dark:border-gray-700',

  // Header section
  headerText: 'text-gray-900 dark:text-gray-100',
  headerSubtext: 'text-gray-500 dark:text-gray-400',

  // Navigation links - inactive
  linkText: 'text-gray-600 dark:text-gray-300',
  linkHover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  linkHoverText: 'hover:text-gray-900 dark:hover:text-gray-100',

  // Navigation links - active
  activeBg: 'bg-blue-50 dark:bg-blue-900/30',
  activeBorder: 'border-l-4 border-blue-500 dark:border-blue-400',
  activeText: 'text-blue-700 dark:text-blue-300',

  // Icon colors by section
  iconColors: {
    dashboard: 'text-blue-600 dark:text-blue-400',
    blog: 'text-blue-600 dark:text-blue-400',
    content: 'text-blue-600 dark:text-blue-400',
    pages: 'text-purple-600 dark:text-purple-400',
    shop: 'text-green-600 dark:text-green-400',
    appointments: 'text-teal-600 dark:text-teal-400',
    users: 'text-pink-600 dark:text-pink-400',
    dev: 'text-orange-600 dark:text-orange-400',
  },
};

// ============================================================================
// Service Comparison Card Colors - For service comparison sections
// ============================================================================
// Three-column card layout with distinct colors for each service type.
// Only stores accent-specific colors. Common text colors use centralized system:
// - Card background: use cardBgColors.base
// - Label text: use headingColors.secondary
// - Value text: use headingColors.primary
export type ServiceType = 'virtualAssistant' | 'dataDocuments' | 'website';

export const serviceComparisonColors: Record<ServiceType, {
  border: string;
  headerBg: string;
  headerText: string;
  pricingBg: string;
  pricingBorder: string;
  pricingLabelText: string;
  pricingValueText: string;
}> = {
  virtualAssistant: {
    border: 'border-2 border-green-200 dark:border-green-600',
    headerBg: 'bg-green-100 dark:bg-green-800',
    headerText: 'text-green-700 dark:text-white',
    pricingBg: 'bg-green-100 dark:bg-green-800',
    pricingBorder: 'border-t border-green-200 dark:border-green-600',
    pricingLabelText: 'text-green-700 dark:text-white',
    pricingValueText: 'text-green-900 dark:text-white',
  },
  dataDocuments: {
    border: 'border-2 border-blue-200 dark:border-blue-600',
    headerBg: 'bg-blue-100 dark:bg-blue-800',
    headerText: 'text-blue-700 dark:text-white',
    pricingBg: 'bg-blue-100 dark:bg-blue-800',
    pricingBorder: 'border-t border-blue-200 dark:border-blue-600',
    pricingLabelText: 'text-blue-700 dark:text-white',
    pricingValueText: 'text-blue-900 dark:text-white',
  },
  website: {
    border: 'border-2 border-purple-200 dark:border-purple-600',
    headerBg: 'bg-purple-100 dark:bg-purple-800',
    headerText: 'text-purple-700 dark:text-white',
    pricingBg: 'bg-purple-100 dark:bg-purple-800',
    pricingBorder: 'border-t border-purple-200 dark:border-purple-600',
    pricingLabelText: 'text-purple-700 dark:text-white',
    pricingValueText: 'text-purple-900 dark:text-white',
  },
};


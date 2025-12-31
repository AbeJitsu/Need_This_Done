// ============================================================================
// Shared Color Utilities - Last verified: Dec 2025
// ============================================================================
// Centralized color class definitions used across cards and components.
// This keeps our styling consistent and avoids duplicating color schemes
// in multiple files.
//
// ============================================================================
// COLOR SYSTEM - WCAG AA Accessibility
// ============================================================================
//
// Two anchor points per color (defined in globals.css):
//   -500: 4.5:1 contrast with WHITE (dark mode backgrounds)
//   -600: 4.5:1 contrast with -100  (light mode minimum text)
//
// THE CORE PATTERN:
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  LIGHT MODE              │  DARK MODE                                   │
// ├─────────────────────────────────────────────────────────────────────────┤
// │  Background: -100        │  Background: -500                            │
// │  Text: -600 (minimum)    │  Text: white                                 │
// │  Hover: -700             │  Hover: white/gray-100                       │
// │  Border: -500            │  Border: -100 (light border pops on dark bg) │
// └─────────────────────────────────────────────────────────────────────────┘
//
// QUICK REFERENCE:
//   bg:     'bg-purple-100 dark:bg-purple-500'
//   text:   'text-purple-600 dark:text-white'  (or -700/-800/-900)
//   border: 'border-purple-500 dark:border-purple-100'
//
// SHADE GUIDE:
//   -50:  Very subtle backgrounds
//   -100: Standard light backgrounds (anchor for -600)
//   -200-400: Interpolated between -100 and -500
//   -500: Dark mode backgrounds (4.5:1 with white)
//   -600: Light mode minimum text (4.5:1 with -100)
//   -700-900: Darker text (all accessible on -100)
//
// ADDING NEW COLORS:
//   1. Follow the pattern above for light/dark mode
//   2. Use AccentVariant type for new color keys
//   3. Test in both light and dark mode
//   4. -600+ is guaranteed 4.5:1 with -100 background
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
export type AccentVariant = 'purple' | 'blue' | 'green' | 'gold' | 'teal' | 'gray' | 'red';

// ============================================================================
// Shadow Classes - Centralized shadow utilities
// ============================================================================
// Consistent shadow patterns for cards, modals, and interactive elements.
// Use these instead of hardcoding shadow values throughout the codebase.
export const shadowClasses = {
  // Subtle shadow for cards at rest
  card: 'shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_0px_rgba(255,255,255,0.05)]',
  // Elevated shadow for cards on hover (consistent with lift effect)
  cardHover: 'hover:shadow-xl',
  // Lift effect for interactive cards (shadow + translate)
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
  gold: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
  green: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
};

// ============================================================================
// Accent Colors - GHOST/OUTLINE style (light bg, colored text)
// ============================================================================
// For badges, chips, and outline-style buttons.
// Light mode: Light pastel bg (-100), colored text (-600)
// Dark mode: Vibrant bg (-500), white text for 4.5:1+ contrast
//
// WHEN TO USE:
//   - CircleBadge, StatusBadge, chips
//   - Outline/ghost button variants
//   - Tags and pills
//
// For SOLID filled buttons (dark bg + white text), use solidButtonColors instead.
//
// Usage: Import and spread in className, e.g.:
//   ${accentColors.gold.bg} ${accentColors.gold.text} ${accentColors.gold.border}

export const accentColors: Record<AccentVariant, {
  bg: string;
  text: string;
  border: string;
  hoverText: string;
  hoverBorder: string;
}> = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    text: 'text-purple-600 dark:text-white',
    border: 'border-purple-500 dark:border-purple-100',
    hoverText: 'hover:text-purple-700 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-purple-600 dark:hover:border-purple-200',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    text: 'text-blue-600 dark:text-white',
    border: 'border-blue-500 dark:border-blue-100',
    hoverText: 'hover:text-blue-700 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-blue-600 dark:hover:border-blue-200',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border-green-500 dark:border-green-100',
    hoverText: 'hover:text-green-700 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-green-600 dark:hover:border-green-200',
  },
  gold: {
    // Dark mode uses gold-500 (#a36b00) - 4.51:1 contrast with white (WCAG AA)
    bg: 'bg-gold-100 dark:bg-gold-500',
    text: 'text-gold-600 dark:text-white',
    border: 'border-gold-500 dark:border-gold-100',
    hoverText: 'hover:text-gold-700 dark:hover:text-gold-100',
    hoverBorder: 'hover:border-gold-600 dark:hover:border-gold-200',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-500',
    text: 'text-teal-600 dark:text-white',
    border: 'border-teal-500 dark:border-teal-100',
    hoverText: 'hover:text-teal-700 dark:hover:text-teal-100',
    hoverBorder: 'hover:border-teal-600 dark:hover:border-teal-200',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-500',
    text: 'text-gray-600 dark:text-white',
    border: 'border-gray-500 dark:border-gray-100',
    hoverText: 'hover:text-gray-700 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-gray-600 dark:hover:border-gray-200',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-500',
    text: 'text-red-600 dark:text-white',
    border: 'border-red-500 dark:border-red-100',
    hoverText: 'hover:text-red-700 dark:hover:text-gray-100',
    hoverBorder: 'hover:border-red-600 dark:hover:border-red-200',
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
// Light mode: -600 shades ensure 4.5:1+ contrast on white (minimum)
// Dark mode: -300 shades ensure 4.5:1+ contrast on gray-800
export const titleColors: Record<AccentColor, string> = {
  purple: 'text-purple-600 dark:text-purple-300',
  blue: 'text-blue-600 dark:text-blue-300',
  green: 'text-green-600 dark:text-green-300',
};

// ============================================================================
// Title Text Colors - For StepCard titles on dark backgrounds
// ============================================================================
// Light mode: -600 text for minimum WCAG AA contrast
// Dark mode: light text (100) for readability on dark gray cards
// Matches CircleBadge number colors for visual cohesion
export const titleTextColors: Record<AccentVariant, string> = {
  purple: 'text-purple-600 dark:text-purple-100',
  blue: 'text-blue-600 dark:text-blue-100',
  green: 'text-green-600 dark:text-green-100',
  gold: 'text-gold-600 dark:text-gold-100',
  teal: 'text-teal-600 dark:text-teal-100',
  gray: 'text-gray-600 dark:text-gray-100',
  red: 'text-red-600 dark:text-red-100',
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
  gold: 'border-l-4 border-l-gold-500',
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
// Checkmark Colors - High contrast icons for feature lists (4.5:1 ratio)
// ============================================================================
// Uses -100 bg with -600 text in light mode, -100 text on -500 bg in dark mode
export const checkmarkColors: Record<AccentColor, {
  bg: string;
  icon: string;
}> = {
  purple: { bg: 'bg-purple-100 dark:bg-purple-500', icon: 'text-purple-600 dark:text-purple-100' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-500', icon: 'text-blue-600 dark:text-blue-100' },
  green: { bg: 'bg-green-100 dark:bg-green-500', icon: 'text-green-600 dark:text-green-100' },
};

// ============================================================================
// Card Hover Colors - For Card component hover states
// ============================================================================
// Centralized hover border colors for cards with color accents
export const cardHoverColors: Record<AccentVariant, string> = {
  green: 'hover:border-green-500 dark:hover:border-green-300',
  blue: 'hover:border-blue-500 dark:hover:border-blue-300',
  purple: 'hover:border-purple-500 dark:hover:border-purple-300',
  gold: 'hover:border-gold-500 dark:hover:border-gold-300',
  teal: 'hover:border-teal-500 dark:hover:border-teal-300',
  gray: 'hover:border-gray-500 dark:hover:border-gray-300',
  red: 'hover:border-red-500 dark:hover:border-red-300',
};

// ============================================================================
// Card Hover Background Tints - Subtle background on hover
// ============================================================================
export const cardHoverBgTints: Record<AccentVariant, string> = {
  purple: 'hover:bg-purple-100 dark:hover:bg-purple-800',
  blue: 'hover:bg-blue-100 dark:hover:bg-blue-800',
  green: 'hover:bg-green-100 dark:hover:bg-green-800',
  gold: 'hover:bg-gold-100 dark:hover:bg-gold-800',
  teal: 'hover:bg-teal-100 dark:hover:bg-teal-800',
  gray: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  red: 'hover:bg-red-100 dark:hover:bg-red-800',
};

// ============================================================================
// Tag Hover Colors - Hover effects for service/status tags
// ============================================================================
// Makes tags feel interactive with color-matched hover states
export const tagHoverColors: Record<AccentVariant, string> = {
  purple: 'hover:bg-purple-200 hover:border-purple-600 dark:hover:bg-purple-800 dark:hover:border-purple-300',
  blue: 'hover:bg-blue-200 hover:border-blue-600 dark:hover:bg-blue-800 dark:hover:border-blue-300',
  green: 'hover:bg-green-200 hover:border-green-600 dark:hover:bg-green-800 dark:hover:border-green-300',
  gold: 'hover:bg-gold-200 hover:border-gold-600 dark:hover:bg-gold-800 dark:hover:border-gold-300',
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
  gold: 'text-gray-600 dark:text-gold-100',
  teal: 'text-gray-600 dark:text-teal-100',
  gray: 'text-gray-600 dark:text-gray-100',
  red: 'text-gray-600 dark:text-red-100',
};

// ============================================================================
// FAQ Colors - Numbered badge styling for FAQ items
// ============================================================================
// Uses AccentVariant subset for FAQ card left borders and text colors
export const faqColors: Record<'purple' | 'blue' | 'green' | 'gold', {
  border: string;
  text: string;
  bg: string;
  numText: string;
  hover: string;
}> = {
  purple: {
    border: 'border-l-purple-500',
    text: 'text-purple-600 dark:text-purple-300',
    bg: 'bg-purple-100 dark:bg-purple-500',
    numText: 'text-purple-600 dark:text-white',
    hover: 'hover:border-purple-400 dark:hover:border-purple-400',
  },
  blue: {
    border: 'border-l-blue-500',
    text: 'text-blue-600 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-500',
    numText: 'text-blue-600 dark:text-white',
    hover: 'hover:border-blue-400 dark:hover:border-blue-400',
  },
  green: {
    border: 'border-l-green-500',
    text: 'text-green-600 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-500',
    numText: 'text-green-600 dark:text-white',
    hover: 'hover:border-green-400 dark:hover:border-green-400',
  },
  gold: {
    border: 'border-l-gold-500',
    text: 'text-gold-600 dark:text-gold-300',
    bg: 'bg-gold-100 dark:bg-gold-500',
    numText: 'text-gold-600 dark:text-white',
    hover: 'hover:border-gold-400 dark:hover:border-gold-400',
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
    container: 'border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-gray-700',
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg',
  },
  success: {
    container: 'border-green-200 dark:border-green-800 bg-green-100 dark:bg-gray-700',
    icon: 'text-green-600 dark:text-green-400',
    hover: 'hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg',
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
  focus: 'focus:ring-2 focus:ring-gold-500 focus:border-gold-500',
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
  // Warning message styling - white text in dark mode for contrast against vibrant bg-gold-500
  warning: 'text-gold-800 dark:text-white',
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
  purple: 'text-purple-600 dark:text-purple-300',
  blue: 'text-blue-600 dark:text-blue-300',
  green: 'text-green-600 dark:text-green-300',
  gold: 'text-gold-600 dark:text-gold-300',
  teal: 'text-teal-600 dark:text-teal-300',
  gray: 'text-gray-600 dark:text-gray-300',
  red: 'text-red-600 dark:text-red-300',
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
  green: 'group-hover:text-green-500 dark:group-hover:text-green-300',
  blue: 'group-hover:text-blue-500 dark:group-hover:text-blue-300',
  purple: 'group-hover:text-purple-500 dark:group-hover:text-purple-300',
  gold: 'group-hover:text-gold-500 dark:group-hover:text-gold-300',
};

// ============================================================================
// Alert Colors - Notification and message box styling
// ============================================================================
// Light mode: -100 shades (consistent with system) with -800 text
// Dark mode: -500 shades (4.5:1 with white) with white text
// Border: 2px width, -400 in dark mode for visibility against -500 backgrounds
export const alertColors = {
  info: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    border: 'border-2 border-blue-200 dark:border-blue-400',
    text: 'text-blue-800 dark:text-white',
    link: 'text-blue-700 dark:text-white underline hover:text-blue-900 dark:hover:text-gray-200',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-500',
    border: 'border-2 border-red-200 dark:border-red-400',
    text: 'text-red-800 dark:text-white',
    link: 'text-red-700 dark:text-white underline hover:text-red-900 dark:hover:text-gray-200',
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-500',
    border: 'border-2 border-green-200 dark:border-green-400',
    text: 'text-green-800 dark:text-white',
    link: 'text-green-700 dark:text-white underline hover:text-green-900 dark:hover:text-gray-200',
  },
  warning: {
    // Dark mode uses gold-500 (#a36b00) - 4.51:1 contrast with white
    bg: 'bg-gold-100 dark:bg-gold-500',
    border: 'border-2 border-gold-200 dark:border-gold-400',
    text: 'text-gold-800 dark:text-white',
    link: 'text-gold-700 dark:text-white underline hover:text-gold-900 dark:hover:text-gray-200',
  },
  // Yellow config warnings - softer than gold warning
  config: {
    bg: 'bg-yellow-100 dark:bg-yellow-800',
    border: 'border border-yellow-200 dark:border-yellow-600',
    text: 'text-yellow-900 dark:text-yellow-100',
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
// Table Header Background - For table thead elements
// ============================================================================
export const tableHeaderBg = 'bg-gray-100 dark:bg-gray-800';

// ============================================================================
// Neutral Accent Backgrounds - Colored in light mode, neutral gray in dark mode
// ============================================================================
// Use for visual elements that should be colorful in light mode but blend into
// the dark theme without being too saturated. NEUTRAL pattern.
export const neutralAccentBg: Record<AccentVariant, string> = {
  purple: 'bg-purple-100 dark:bg-gray-800',
  blue: 'bg-blue-100 dark:bg-gray-800',
  green: 'bg-green-100 dark:bg-gray-800',
  gold: 'bg-gold-100 dark:bg-gray-800',
  red: 'bg-red-100 dark:bg-gray-800',
  teal: 'bg-teal-100 dark:bg-gray-800',
  gray: 'bg-gray-100 dark:bg-gray-700',
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
    icon: 'text-green-600 dark:text-green-100',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    border: 'border-2 border-blue-500 dark:border-blue-200',
    icon: 'text-blue-600 dark:text-blue-100',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    border: 'border-2 border-purple-500 dark:border-purple-200',
    icon: 'text-purple-600 dark:text-purple-100',
  },
};

// ============================================================================
// Chip Colors - Pill-shaped navigation links (NEUTRAL pattern)
// ============================================================================
// Used for tag-style links that stay neutral gray in both modes.
// Different from accentColors which use INVERSION pattern.
export const chipColors = {
  bg: 'bg-gray-100 dark:bg-gray-700',
  text: 'text-gray-900 dark:text-gray-100',
  hover: 'hover:bg-gray-200 dark:hover:bg-gray-600',
};

// ============================================================================
// Card Background Colors - For card containers
// ============================================================================
export const cardBgColors = {
  base: 'bg-white dark:bg-gray-800',
  elevated: 'bg-gray-100 dark:bg-gray-700',
  interactive: 'hover:bg-gray-100 dark:hover:bg-gray-700',
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
    // Gray instead of yellow - yellow can't meet 4.5:1 with white without looking brown
    bg: 'bg-gray-100 dark:bg-gray-500',
    text: 'text-gray-600 dark:text-white',
    border: 'border border-gray-500 dark:border-gray-100',
  },
  approved: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    text: 'text-blue-600 dark:text-white',
    border: 'border border-blue-500 dark:border-blue-100',
  },
  confirmed: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-500',
    text: 'text-red-600 dark:text-white',
    border: 'border border-red-500 dark:border-red-100',
  },
  rejected: {
    bg: 'bg-red-100 dark:bg-red-500',
    text: 'text-red-600 dark:text-white',
    border: 'border border-red-500 dark:border-red-100',
  },
  paid: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  unpaid: {
    bg: 'bg-gray-100 dark:bg-gray-500',
    text: 'text-gray-600 dark:text-white',
    border: 'border border-gray-500 dark:border-gray-100',
  },
  refunded: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    text: 'text-purple-600 dark:text-white',
    border: 'border border-purple-500 dark:border-purple-100',
  },
  // Order-specific statuses
  delivered: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  shipped: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    text: 'text-blue-600 dark:text-white',
    border: 'border border-blue-500 dark:border-blue-100',
  },
  processing: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    text: 'text-purple-600 dark:text-white',
    border: 'border border-purple-500 dark:border-purple-100',
  },
  // Appointment-specific statuses
  modified: {
    bg: 'bg-blue-100 dark:bg-blue-500',
    text: 'text-blue-600 dark:text-white',
    border: 'border border-blue-500 dark:border-blue-100',
  },
  // User role/status badges
  admin: {
    bg: 'bg-purple-100 dark:bg-purple-500',
    text: 'text-purple-600 dark:text-white',
    border: 'border border-purple-500 dark:border-purple-100',
  },
  user: {
    bg: 'bg-gray-100 dark:bg-gray-500',
    text: 'text-gray-600 dark:text-white',
    border: 'border border-gray-500 dark:border-gray-100',
  },
  active: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  disabled: {
    bg: 'bg-red-100 dark:bg-red-500',
    text: 'text-red-600 dark:text-white',
    border: 'border border-red-500 dark:border-red-100',
  },
  // Page/content statuses
  published: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  draft: {
    bg: 'bg-gray-100 dark:bg-gray-500',
    text: 'text-gray-600 dark:text-white',
    border: 'border border-gray-500 dark:border-gray-100',
  },
  customized: {
    bg: 'bg-green-100 dark:bg-green-500',
    text: 'text-green-600 dark:text-white',
    border: 'border border-green-500 dark:border-green-100',
  },
  default: {
    bg: 'bg-gray-100 dark:bg-gray-500',
    text: 'text-gray-600 dark:text-white',
    border: 'border border-gray-500 dark:border-gray-100',
  },
};

// ============================================================================
// Category Badge Colors - For changelog and content categorization
// ============================================================================
// Consistent styling for category badges across pages
// Category badges: -600 text in light mode for WCAG AA minimum
export const categoryBadgeColors: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-600 dark:bg-purple-500 dark:text-white',
  Shop: 'bg-green-100 text-green-600 dark:bg-green-500 dark:text-white',
  Dashboard: 'bg-blue-100 text-blue-600 dark:bg-blue-500 dark:text-white',
  Public: 'bg-gray-100 text-gray-600 dark:bg-gray-500 dark:text-white',
};

// ============================================================================
// File Upload Colors - For file upload dropzones
// ============================================================================
export const fileUploadColors = {
  border: 'border-2 border-dashed border-gray-300 dark:border-gray-600',
  hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
  bg: 'bg-gray-100 dark:bg-gray-800',
  hoverBg: 'hover:bg-gray-200 dark:hover:bg-gray-700',
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
  section: 'bg-gray-100 dark:bg-gray-800',
  gradient: 'bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800',
};

// ============================================================================
// Gradient Colors - For decorative gradients across the site
// ============================================================================
// Centralized gradient definitions to maintain consistency
export const gradientColors = {
  // Page background gradient for Puck pages
  pageBackground: 'bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900',
  // Popular badge gradient
  popularBadge: 'bg-gradient-to-r from-blue-500 to-blue-600',
  // Avatar placeholder gradient
  avatarPlaceholder: 'bg-gradient-to-br from-purple-400 to-blue-500',
};

// ============================================================================
// Solid Button Colors - FILLED style (dark bg, white text)
// ============================================================================
// For primary action buttons, CTAs, and buttons that need to stand out.
// Light mode: -600 shade for backgrounds, -700 on hover
// Dark mode: -600 shade for backgrounds (same as light for 4.5:1+ contrast with white)
//
// WHEN TO USE:
//   - Primary action buttons ("Get Started", "Submit", "Send")
//   - CTAs that need to stand out
//   - Modal confirm buttons
//
// For GHOST/OUTLINE style (light bg, colored text), use accentColors instead.
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
  gold: {
    // Gold CTA buttons use light bg + dark text in BOTH modes (no inversion)
    // Stands out against dark backgrounds while maintaining consistent branding
    bg: 'bg-gold-100',
    hover: 'hover:bg-gold-200',
    text: 'text-gold-900',
    focus: 'focus:ring-2 focus:ring-gold-500',
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
  gold: 'bg-gold-500 text-white',
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

  // Navigation links - active (NO opacity in dark mode - solid colors only)
  activeBg: 'bg-blue-100 dark:bg-blue-800',
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
    dev: 'text-gold-600 dark:text-gold-400',
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
    border: 'border-2 border-green-200 dark:border-green-400',
    headerBg: 'bg-green-100 dark:bg-green-500',
    headerText: 'text-green-600 dark:text-white',
    pricingBg: 'bg-green-100 dark:bg-green-500',
    pricingBorder: 'border-t border-green-200 dark:border-green-400',
    pricingLabelText: 'text-green-600 dark:text-white',
    pricingValueText: 'text-green-700 dark:text-white',
  },
  dataDocuments: {
    border: 'border-2 border-blue-200 dark:border-blue-400',
    headerBg: 'bg-blue-100 dark:bg-blue-500',
    headerText: 'text-blue-600 dark:text-white',
    pricingBg: 'bg-blue-100 dark:bg-blue-500',
    pricingBorder: 'border-t border-blue-200 dark:border-blue-400',
    pricingLabelText: 'text-blue-600 dark:text-white',
    pricingValueText: 'text-blue-700 dark:text-white',
  },
  website: {
    border: 'border-2 border-purple-200 dark:border-purple-400',
    headerBg: 'bg-purple-100 dark:bg-purple-500',
    headerText: 'text-purple-600 dark:text-white',
    pricingBg: 'bg-purple-100 dark:bg-purple-500',
    pricingBorder: 'border-t border-purple-200 dark:border-purple-400',
    pricingLabelText: 'text-purple-600 dark:text-white',
    pricingValueText: 'text-purple-700 dark:text-white',
  },
};

// ============================================================================
// Info Banner Colors - For tip boxes, info callouts, and notices
// ============================================================================
// Used for informational banners like "💡 Quick Tip" sections.
// Light mode: -100 bg with -200 border, -800 heading, -700 body text
// Dark mode: -800 bg with -600 border, white heading, -100 body text
export const infoBannerColors: Record<AccentVariant, {
  bg: string;
  border: string;
  heading: string;
  text: string;
}> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    border: 'border border-blue-200 dark:border-blue-600',
    heading: 'text-blue-800 dark:text-white',
    text: 'text-blue-700 dark:text-blue-100',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    border: 'border border-purple-200 dark:border-purple-600',
    heading: 'text-purple-800 dark:text-white',
    text: 'text-purple-700 dark:text-purple-100',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-800',
    border: 'border border-green-200 dark:border-green-600',
    heading: 'text-green-800 dark:text-white',
    text: 'text-green-700 dark:text-green-100',
  },
  gold: {
    bg: 'bg-gold-100 dark:bg-gold-800',
    border: 'border border-gold-200 dark:border-gold-600',
    heading: 'text-gold-800 dark:text-white',
    text: 'text-gold-700 dark:text-gold-100',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-800',
    border: 'border border-red-200 dark:border-red-600',
    heading: 'text-red-800 dark:text-white',
    text: 'text-red-700 dark:text-red-100',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-800',
    border: 'border border-teal-200 dark:border-teal-600',
    heading: 'text-teal-800 dark:text-white',
    text: 'text-teal-700 dark:text-teal-100',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border border-gray-200 dark:border-gray-600',
    heading: 'text-gray-800 dark:text-white',
    text: 'text-gray-700 dark:text-gray-100',
  },
};

// ============================================================================
// Icon Circle Colors - For circular icon containers (empty state, features)
// ============================================================================
// Used for decorative icon circles in empty states and feature lists.
// Light mode: -100 bg, dark mode: -800 bg (not -500, for subtlety)
export const iconCircleColors: Record<AccentVariant, {
  bg: string;
  icon: string;
}> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    icon: 'text-blue-600 dark:text-blue-300',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    icon: 'text-purple-600 dark:text-purple-300',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-800',
    icon: 'text-green-600 dark:text-green-300',
  },
  gold: {
    bg: 'bg-gold-100 dark:bg-gold-800',
    icon: 'text-gold-600 dark:text-gold-300',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-800',
    icon: 'text-red-600 dark:text-red-300',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-800',
    icon: 'text-teal-600 dark:text-teal-300',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    icon: 'text-gray-600 dark:text-gray-300',
  },
};

// ============================================================================
// Selected State Colors - For selected/active items in lists and pickers
// ============================================================================
// Used for selected items in template pickers, block editors, etc.
// Light mode: -100 bg with -500 border, dark mode: -800 bg with -400 border
export const selectedStateColors: Record<AccentVariant, {
  bg: string;
  border: string;
  text: string;
}> = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-800',
    border: 'border-purple-500 dark:border-purple-400',
    text: 'text-purple-700 dark:text-purple-200',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-800',
    border: 'border-blue-500 dark:border-blue-400',
    text: 'text-blue-700 dark:text-blue-200',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-800',
    border: 'border-green-500 dark:border-green-400',
    text: 'text-green-700 dark:text-green-200',
  },
  gold: {
    bg: 'bg-gold-100 dark:bg-gold-800',
    border: 'border-gold-500 dark:border-gold-400',
    text: 'text-gold-700 dark:text-gold-200',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-800',
    border: 'border-red-500 dark:border-red-400',
    text: 'text-red-700 dark:text-red-200',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-800',
    border: 'border-teal-500 dark:border-teal-400',
    text: 'text-teal-700 dark:text-teal-200',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    border: 'border-gray-500 dark:border-gray-400',
    text: 'text-gray-700 dark:text-gray-200',
  },
};

// ============================================================================
// Soft Background Colors - For Puck components and subtle accents
// ============================================================================
// Replaces opacity backgrounds (dark:bg-*/20) with solid colors.
// Light mode: -100, dark mode: -800 (not -500, for subtlety)
export const softBgColors: Record<AccentVariant, string> = {
  purple: 'bg-purple-100 dark:bg-purple-800',
  blue: 'bg-blue-100 dark:bg-blue-800',
  green: 'bg-green-100 dark:bg-green-800',
  gold: 'bg-gold-100 dark:bg-gold-800',
  red: 'bg-red-100 dark:bg-red-800',
  teal: 'bg-teal-100 dark:bg-teal-800',
  gray: 'bg-gray-100 dark:bg-gray-700',
};

// ============================================================================
// Very Soft Background Colors - For subtle section backgrounds
// ============================================================================
// Similar to softBgColors but with darker dark mode for more subtlety.
// Light mode: -100 (consistent with system), dark mode: -900 (very subtle)
export const verySoftBgColors: Record<AccentVariant, string> = {
  purple: 'bg-purple-100 dark:bg-purple-900',
  blue: 'bg-blue-100 dark:bg-blue-900',
  green: 'bg-green-100 dark:bg-green-900',
  gold: 'bg-gold-100 dark:bg-gold-900',
  red: 'bg-red-100 dark:bg-red-900',
  teal: 'bg-teal-100 dark:bg-teal-900',
  gray: 'bg-gray-100 dark:bg-gray-800',
};

// ============================================================================
// Hover Background Colors - For interactive element hover states
// ============================================================================
// Solid hover backgrounds to replace opacity patterns (dark:hover:bg-*/30).
// Light mode: hover:-200, dark mode: hover:-700 (visible on dark backgrounds)
export const hoverBgColors: Record<AccentVariant, string> = {
  purple: 'hover:bg-purple-200 dark:hover:bg-purple-700',
  blue: 'hover:bg-blue-200 dark:hover:bg-blue-700',
  green: 'hover:bg-green-200 dark:hover:bg-green-700',
  gold: 'hover:bg-gold-200 dark:hover:bg-gold-700',
  red: 'hover:bg-red-200 dark:hover:bg-red-700',
  teal: 'hover:bg-teal-200 dark:hover:bg-teal-700',
  gray: 'hover:bg-gray-200 dark:hover:bg-gray-600',
};

// ============================================================================
// UI Chrome Colors - For toolbars, footers, panels
// ============================================================================
// Neutral backgrounds for UI chrome elements (solid colors, no opacity).
// Light mode: -100 (consistent with system), dark mode: -800 (visible)
export const uiChromeBg = {
  toolbar: 'bg-gray-100 dark:bg-gray-800',
  footer: 'bg-gray-100 dark:bg-gray-800',
  panel: 'bg-gray-100 dark:bg-gray-800',
};

// ============================================================================
// Toggle Button Colors - For toggle/pill button states
// ============================================================================
// Button-like elements that toggle between active/inactive states.
export const toggleButtonColors: Record<AccentVariant, {
  inactive: string;
  inactiveHover: string;
}> = {
  purple: {
    inactive: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300',
    inactiveHover: 'hover:bg-purple-200 dark:hover:bg-purple-700',
  },
  blue: {
    inactive: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',
    inactiveHover: 'hover:bg-blue-200 dark:hover:bg-blue-700',
  },
  green: {
    inactive: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
    inactiveHover: 'hover:bg-green-200 dark:hover:bg-green-700',
  },
  gold: {
    inactive: 'bg-gold-100 dark:bg-gold-800 text-gold-600 dark:text-gold-300',
    inactiveHover: 'hover:bg-gold-200 dark:hover:bg-gold-700',
  },
  red: {
    inactive: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
    inactiveHover: 'hover:bg-red-200 dark:hover:bg-red-700',
  },
  teal: {
    inactive: 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-300',
    inactiveHover: 'hover:bg-teal-200 dark:hover:bg-teal-700',
  },
  gray: {
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    inactiveHover: 'hover:bg-gray-200 dark:hover:bg-gray-600',
  },
};

// ============================================================================
// Status Indicator Colors - For health/status displays
// ============================================================================
// Used for system health, connection status, and similar indicators.
// Follows the -100/-800 pattern for consistency.
export const statusIndicatorBg = {
  healthy: 'bg-green-100 dark:bg-green-800',
  warning: 'bg-amber-100 dark:bg-amber-800',
  error: 'bg-red-100 dark:bg-red-800',
  loading: 'bg-blue-100 dark:bg-blue-800',
  modified: 'bg-yellow-100 dark:bg-yellow-800',
};

// ============================================================================
// Container Backgrounds - Neutral gray patterns for page sections
// ============================================================================
// Use for page backgrounds, form containers, and content areas.
// Pattern B (neutral): Uses gray scale, not accent colors.
export const containerBg = {
  // Page backgrounds (light: -100, dark: -900)
  page: 'bg-gray-100 dark:bg-gray-900',
  // Elevated sections on page background
  elevated: 'bg-white dark:bg-gray-800',
  // Subtle cards within elevated sections
  subtle: 'bg-gray-200 dark:bg-gray-700',
};

// ============================================================================
// Outline Button Colors - Bordered buttons with transparent backgrounds
// ============================================================================
// Used for secondary CTAs, outline-style buttons.
// Light mode: colored border + text, light hover bg
// Dark mode: colored border + lighter text, solid hover bg
export const outlineButtonColors: Record<AccentVariant, {
  base: string;
  hover: string;
}> = {
  purple: {
    base: 'border-purple-500 text-purple-600 dark:text-purple-300',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-800',
  },
  blue: {
    base: 'border-blue-500 text-blue-600 dark:text-blue-300',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-800',
  },
  green: {
    base: 'border-green-500 text-green-600 dark:text-green-300',
    hover: 'hover:bg-green-100 dark:hover:bg-green-800',
  },
  gold: {
    base: 'border-gold-500 text-gold-600 dark:text-gold-300',
    hover: 'hover:bg-gold-100 dark:hover:bg-gold-800',
  },
  teal: {
    base: 'border-teal-500 text-teal-600 dark:text-teal-300',
    hover: 'hover:bg-teal-100 dark:hover:bg-teal-800',
  },
  gray: {
    base: 'border-gray-500 text-gray-600 dark:text-gray-300',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  },
  red: {
    base: 'border-red-500 text-red-600 dark:text-red-300',
    hover: 'hover:bg-red-100 dark:hover:bg-red-800',
  },
};

// ============================================================================
// Colored Link Text - Text colors for interactive links
// ============================================================================
// Extends basic linkColors with all accent variants.
// -600 in light mode (4.5:1 on white), -400 in dark mode (visible on dark bg)
export const coloredLinkText: Record<AccentVariant, string> = {
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  gold: 'text-gold-600 dark:text-gold-400',
  teal: 'text-teal-600 dark:text-teal-400',
  gray: 'text-gray-600 dark:text-gray-400',
  red: 'text-red-600 dark:text-red-400',
};

// ============================================================================
// Status Action Button Colors - For enable/disable toggle buttons
// ============================================================================
// Used for action buttons that toggle status (enable/disable user, etc.)
// Bordered style with hover background.
export const statusActionColors = {
  enable: {
    base: 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-300',
    hover: 'hover:bg-green-100 dark:hover:bg-green-800',
  },
  disable: {
    base: 'border-red-300 text-red-700 dark:border-red-600 dark:text-red-300',
    hover: 'hover:bg-red-100 dark:hover:bg-red-800',
  },
};

// ============================================================================
// Stripe Appearance Colors - Hex values for Stripe Elements configuration
// ============================================================================
// Stripe Elements requires actual hex values (not CSS classes).
// These match our Tailwind color scale for consistency.
// Reference: https://stripe.com/docs/elements/appearance-api
export const stripeAppearance = {
  // Matches our purple accent (purple-400)
  colorPrimary: '#a78bfa',
  // Dark background (gray-800)
  colorBackground: '#1f2937',
  // Light text for dark mode (gray-50)
  colorText: '#f9fafb',
  // Error/danger state (red-400)
  colorDanger: '#f87171',
  // Input border (gray-600)
  borderColor: '#4b5563',
  // Input background darker than container (gray-900)
  inputBackground: '#111827',
};


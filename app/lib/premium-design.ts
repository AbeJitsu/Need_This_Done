// ============================================================================
// Premium Design System - Consistent, Polished UI Components
// ============================================================================
// This file centralizes premium design tokens to ensure visual consistency
// across all pages. Import from here for cards, sections, animations, and more.
//
// PHILOSOPHY:
// - Shadows over borders (depth, not lines)
// - Subtle hover effects (lift + glow)
// - Consistent animation timing
// - Typography with personality
//
// ============================================================================

// ============================================================================
// TYPOGRAPHY SCALE - Premium Type Hierarchy
// ============================================================================
// Creates visual drama through size contrast. Use display fonts for headlines.
//
// Usage:
//   <h1 className={typography.hero}>Big Impact Headline</h1>
//   <p className={typography.body}>Regular paragraph text</p>

export const typography = {
  // Page hero headlines - maximum impact (72px desktop)
  hero: 'text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight',

  // Section headers (48px desktop)
  h1: 'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',

  // Card titles, subsection headers (32px desktop)
  h2: 'text-2xl sm:text-3xl font-bold',

  // Component titles (24px desktop)
  h3: 'text-xl sm:text-2xl font-semibold',

  // Labels, small headers (20px)
  h4: 'text-lg font-semibold',

  // Body copy (16px)
  body: 'text-base leading-relaxed',

  // Large body for hero descriptions (20px)
  bodyLarge: 'text-lg md:text-xl leading-relaxed',

  // Small text, captions (14px)
  small: 'text-sm',

  // Eyebrow text - uppercase labels
  eyebrow: 'text-xs sm:text-sm font-semibold uppercase tracking-wider',

  // Gradient text effect (apply to container, works with any text size)
  gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent',

  // Muted text colors
  muted: 'text-gray-500 dark:text-gray-400',
  mutedLight: 'text-gray-400 dark:text-gray-500',
};

// ============================================================================
// SHADOW SYSTEM - Depth Without Borders
// ============================================================================
// Premium cards use shadows for depth, not visible borders.
// The border provides structure but should be nearly invisible.
//
// Usage:
//   <div className={`${shadows.card} ${shadows.hoverLift}`}>Card content</div>

export const shadows = {
  // Subtle resting shadow for cards
  card: 'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]',

  // Medium shadow for elevated elements
  elevated: 'shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]',

  // Large shadow for modals, dropdowns
  large: 'shadow-[0_10px_15px_rgba(0,0,0,0.04),0_4px_6px_rgba(0,0,0,0.06)]',

  // Hover shadow (use with hoverLift)
  hover: 'shadow-[0_14px_20px_rgba(0,0,0,0.06),0_6px_8px_rgba(0,0,0,0.08)]',

  // Colored glow for accent cards (combine with accentGlow[color])
  glow: 'shadow-[0_0_20px_rgba(0,0,0,0.1)]',

  // Hover lift effect - combines shadow + transform
  hoverLift: 'hover:shadow-[0_14px_20px_rgba(0,0,0,0.06),0_6px_8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300',

  // Subtle hover without lift (for inline cards)
  hoverSubtle: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300',
};

// Colored glow shadows for accent cards
export const accentGlow = {
  blue: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]',
  purple: 'hover:shadow-[0_8px_30px_rgba(147,51,234,0.15)]',
  green: 'hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)]',
  gold: 'hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)]',
  teal: 'hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)]',
};

// ============================================================================
// BORDER SYSTEM - Subtle, Consistent Borders
// ============================================================================
// Premium borders are barely visible - they provide structure without distraction.
// Use the SAME border across all cards and sections for consistency.
//
// Usage:
//   <div className={borders.card}>Consistent card border</div>
//   <div className={borders.section}>Section container</div>

export const borders = {
  // Standard card border - nearly invisible, provides structure
  card: 'border border-gray-400 dark:border-gray-700/60',

  // Section container border - same as card for consistency
  section: 'border border-gray-400 dark:border-gray-700/60',

  // Slightly more visible border (use sparingly)
  visible: 'border border-gray-400 dark:border-gray-700',

  // Input field border
  input: 'border border-gray-400 dark:border-gray-600',

  // Divider line
  divider: 'border-t border-gray-400 dark:border-gray-700',

  // No border (for cards that rely solely on shadow)
  none: 'border-0',

  // Hover border enhancement
  hoverAccent: {
    blue: 'hover:border-blue-300 dark:hover:border-blue-600',
    purple: 'hover:border-purple-300 dark:hover:border-purple-600',
    green: 'hover:border-green-300 dark:hover:border-green-600',
    gold: 'hover:border-gold-300 dark:hover:border-gold-600',
    teal: 'hover:border-emerald-300 dark:hover:border-emerald-600',
  },
};

// ============================================================================
// ANIMATION TOKENS - Consistent Motion
// ============================================================================
// Standardized animation timing and easing for premium feel.
//
// Usage:
//   <div className={`${animation.fadeUp} ${animation.delay[1]}`}>Animated content</div>

export const animation = {
  // Base transition for interactive elements
  base: 'transition-all duration-300 ease-out',

  // Fast transition for micro-interactions
  fast: 'transition-all duration-150 ease-out',

  // Slow transition for dramatic reveals
  slow: 'transition-all duration-500 ease-out',

  // Fade up entrance animation (requires CSS keyframes)
  fadeUp: 'animate-slide-up',

  // Scale in animation
  scaleIn: 'animate-scale-in',

  // Stagger delays (100ms increments)
  delay: {
    0: '',
    1: 'animate-delay-100',
    2: 'animate-delay-200',
    3: 'animate-delay-300',
    4: 'animate-delay-400',
    5: 'animate-delay-500',
  },

  // Easing curves (for custom animations)
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// PREMIUM CARD STYLES - Ready-to-Use Card Classes
// ============================================================================
// Complete card styling with shadows, borders, hover effects.
// Just add these classes and you get premium cards instantly.
//
// Usage:
//   <div className={premiumCard.base}>Basic premium card</div>
//   <div className={premiumCard.interactive}>Clickable card with hover</div>

export const premiumCard = {
  // Base card - subtle shadow, barely-visible border, rounded corners
  base: `
    bg-white dark:bg-gray-800
    rounded-2xl
    border border-gray-400 dark:border-gray-700/60
    shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]
  `.replace(/\s+/g, ' ').trim(),

  // Interactive card - adds hover lift and shadow
  interactive: `
    bg-white dark:bg-gray-800
    rounded-2xl
    border border-gray-400 dark:border-gray-700/60
    shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]
    hover:shadow-[0_14px_20px_rgba(0,0,0,0.06),0_6px_8px_rgba(0,0,0,0.08)]
    hover:-translate-y-1
    transition-all duration-300
    cursor-pointer
  `.replace(/\s+/g, ' ').trim(),

  // Featured/highlighted card - slightly elevated
  featured: `
    bg-white dark:bg-gray-800
    rounded-2xl
    border border-gray-400 dark:border-gray-700/60
    shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]
    hover:shadow-[0_14px_20px_rgba(0,0,0,0.06),0_6px_8px_rgba(0,0,0,0.08)]
    hover:-translate-y-1
    transition-all duration-300
  `.replace(/\s+/g, ' ').trim(),

  // Flat card - no shadow, just border (for dense layouts)
  flat: `
    bg-white dark:bg-gray-800
    rounded-xl
    border border-gray-400 dark:border-gray-700
  `.replace(/\s+/g, ' ').trim(),

  // Inner card (nested inside sections) - subtle bg difference
  inner: `
    bg-gray-50 dark:bg-gray-700/50
    rounded-xl
    border-0
  `.replace(/\s+/g, ' ').trim(),

  // Padding variants (apply in addition to card base)
  padding: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
};

// ============================================================================
// SECTION CONTAINER STYLES - Consistent Page Sections
// ============================================================================
// For wrapping page sections with consistent styling.
//
// Usage:
//   <section className={sectionContainer.base}>Section content</section>

export const sectionContainer = {
  // Standard section with border and shadow
  base: `
    bg-white dark:bg-gray-800
    rounded-2xl
    border border-gray-400 dark:border-gray-700/60
    shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]
    p-8
  `.replace(/\s+/g, ' ').trim(),

  // Section without visible container (just content)
  transparent: 'py-8',

  // Elevated section (more shadow)
  elevated: `
    bg-white dark:bg-gray-800
    rounded-2xl
    border border-gray-400 dark:border-gray-700/60
    shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]
    p-8
  `.replace(/\s+/g, ' ').trim(),

  // Dark section (inverted colors)
  dark: `
    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
    rounded-3xl
    overflow-hidden
    relative
  `.replace(/\s+/g, ' ').trim(),

  // Subtle background section
  subtle: `
    bg-gray-50 dark:bg-gray-800/50
    rounded-2xl
    p-8
  `.replace(/\s+/g, ' ').trim(),
};

// ============================================================================
// DARK SECTION COMPONENTS - For CTAs and Heroes
// ============================================================================
// Premium dark sections with gradients and decorative elements.
//
// Usage:
//   <div className={darkSection.base}>
//     <div className={darkSection.glow.topLeft} />
//     <div className={darkSection.content}>Content here</div>
//   </div>

export const darkSection = {
  // Base container
  base: `
    relative overflow-hidden
    rounded-3xl
    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
  `.replace(/\s+/g, ' ').trim(),

  // Decorative glow elements (position absolute)
  glow: {
    topLeft: 'absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2',
    bottomRight: 'absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3',
    center: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent',
  },

  // Content wrapper (relative z-10)
  content: 'relative z-10 px-8 py-16 md:py-20 text-center',

  // Text colors for dark sections
  text: {
    heading: 'text-white',
    body: 'text-slate-300',
    muted: 'text-slate-400',
  },

  // Eyebrow badge
  eyebrow: 'inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-300 text-sm font-medium backdrop-blur-sm',

  // Primary CTA button on dark
  ctaButton: `
    inline-flex items-center gap-3
    px-8 py-4
    bg-white text-slate-900
    font-semibold text-lg
    rounded-2xl
    hover:bg-slate-100
    transition-all duration-200
    shadow-xl hover:shadow-2xl
    hover:scale-105 active:scale-100
  `.replace(/\s+/g, ' ').trim(),

  // Trust indicators
  trustIndicator: 'flex items-center gap-2 text-sm text-slate-400',
  trustDot: 'w-1.5 h-1.5 rounded-full bg-emerald-400',
};

// ============================================================================
// ICON CONTAINERS - Consistent Icon Styling
// ============================================================================
// For icon circles, badges, and decorative icons.
//
// Usage:
//   <div className={iconContainer.circle.md}>
//     <Icon className={iconContainer.iconColor.blue} />
//   </div>

export const iconContainer = {
  // Circular icon containers
  circle: {
    sm: 'w-8 h-8 rounded-lg flex items-center justify-center',
    md: 'w-10 h-10 rounded-lg flex items-center justify-center',
    lg: 'w-12 h-12 rounded-xl flex items-center justify-center',
    xl: 'w-14 h-14 rounded-xl flex items-center justify-center',
  },

  // Background colors for icon containers
  bg: {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    gold: 'bg-gold-100 dark:bg-gold-900/30',
    teal: 'bg-emerald-100 dark:bg-emerald-900/30',
    gray: 'bg-gray-100 dark:bg-gray-700',
  },

  // Icon colors
  iconColor: {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    gold: 'text-gold-600 dark:text-gold-400',
    teal: 'text-emerald-600 dark:text-emerald-400',
    gray: 'text-gray-600 dark:text-gray-400',
  },

  // Icon sizes
  iconSize: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  },
};

// ============================================================================
// BUTTON STYLES - Premium Button Variants
// ============================================================================
// Use with the Button component or standalone.
//
// Usage:
//   <button className={buttonStyles.primary}>Primary Action</button>
//   <button className={buttonStyles.secondary}>Secondary</button>

export const buttonStyles = {
  // Base button styles (shared)
  base: 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2',

  // Size variants
  size: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  },

  // Primary (solid gold/accent)
  primary: 'bg-gold-100 text-gold-900 hover:bg-gold-200 focus:ring-gold-500',

  // Secondary (outline)
  secondary: 'border-2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',

  // Ghost (minimal)
  ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',

  // Danger
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

// ============================================================================
// SPACING UTILITIES - Consistent Gaps and Margins
// ============================================================================
// Standardized spacing for layouts.

export const spacing = {
  // Section margins (between major page sections)
  sectionGap: 'mb-16',
  sectionGapLarge: 'mb-20',

  // Card grid gaps
  cardGrid: 'gap-6',
  cardGridTight: 'gap-4',

  // Content padding inside cards
  cardPadding: 'p-6',
  cardPaddingLarge: 'p-8',

  // Max widths
  maxWidth: {
    content: 'max-w-6xl mx-auto',
    narrow: 'max-w-3xl mx-auto',
    wide: 'max-w-7xl mx-auto',
  },

  // Responsive padding
  pagePadding: 'px-4 sm:px-6 md:px-8',
};

// ============================================================================
// QUICK COMBOS - Common Patterns Ready to Use
// ============================================================================
// Pre-built combinations for common use cases.
//
// Usage:
//   <div className={combo.cardWithHover}>Clickable card</div>

export const combo = {
  // Card with hover lift effect
  cardWithHover: `
    ${premiumCard.interactive}
    ${premiumCard.padding.md}
  `.replace(/\s+/g, ' ').trim(),

  // Section container with standard padding
  section: `
    ${sectionContainer.base}
  `.replace(/\s+/g, ' ').trim(),

  // Page wrapper with max width and padding
  pageWrapper: `
    ${spacing.maxWidth.content}
    ${spacing.pagePadding}
    py-8
  `.replace(/\s+/g, ' ').trim(),

  // Centered text section
  centeredSection: `
    text-center
    ${spacing.maxWidth.narrow}
    ${spacing.sectionGap}
  `.replace(/\s+/g, ' ').trim(),

  // Grid of cards (3 column)
  cardGrid3: `
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    ${spacing.cardGrid}
  `.replace(/\s+/g, ' ').trim(),

  // Grid of cards (2 column)
  cardGrid2: `
    grid grid-cols-1 md:grid-cols-2
    ${spacing.cardGrid}
  `.replace(/\s+/g, ' ').trim(),
};

// ============================================================================
// GLASS MORPHISM - Premium Glass Effects
// ============================================================================
// Glass effects create depth and premium feel, inspired by the modals.
// Use sparingly for hero sections, overlays, and premium cards.
//
// Usage:
//   <div className={glass.card}>Glass card content</div>
//   <div className={glass.overlay}>Overlay content</div>

export const glass = {
  // Glass card with blur backdrop (for use over colored backgrounds)
  card: `
    bg-white/80 dark:bg-gray-800/80
    backdrop-blur-xl
    rounded-2xl
    border border-white/60 dark:border-gray-700/60
    shadow-[0_8px_32px_rgba(0,0,0,0.08)]
  `.replace(/\s+/g, ' ').trim(),

  // Interactive glass card with hover
  cardInteractive: `
    bg-white/80 dark:bg-gray-800/80
    backdrop-blur-xl
    rounded-2xl
    border border-white/60 dark:border-gray-700/60
    shadow-[0_8px_32px_rgba(0,0,0,0.08)]
    hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]
    hover:-translate-y-1
    hover:bg-white/90 dark:hover:bg-gray-800/90
    transition-all duration-300
    cursor-pointer
  `.replace(/\s+/g, ' ').trim(),

  // Glass overlay (for modal backdrops)
  overlay: 'bg-black/40 backdrop-blur-sm',

  // Glass panel (for modals and floating UI)
  panel: `
    bg-white/95 dark:bg-gray-800/95
    backdrop-blur-xl
    rounded-3xl
    border border-white/60 dark:border-gray-700/60
    shadow-2xl
  `.replace(/\s+/g, ' ').trim(),

  // Subtle glass effect (for cards on light backgrounds)
  subtle: `
    bg-white/60 dark:bg-gray-800/60
    backdrop-blur-md
    rounded-xl
    border border-white/80 dark:border-gray-700/60
  `.replace(/\s+/g, ' ').trim(),

  // Gradient glass backgrounds (color-themed)
  gradient: {
    blue: 'bg-gradient-to-br from-blue-50/80 via-white/80 to-blue-50/80 backdrop-blur-xl',
    green: 'bg-gradient-to-br from-emerald-50/80 via-white/80 to-emerald-50/80 backdrop-blur-xl',
    purple: 'bg-gradient-to-br from-purple-50/80 via-white/80 to-purple-50/80 backdrop-blur-xl',
    gold: 'bg-gradient-to-br from-gold-50/80 via-white/80 to-gold-50/80 backdrop-blur-xl',
    teal: 'bg-gradient-to-br from-emerald-50/80 via-white/80 to-blue-50/80 backdrop-blur-xl',
  },
};

// ============================================================================
// HERO GRADIENT PRESETS - Page-Specific Color Personalities
// ============================================================================
// Each page gets its own color theme using the same premium technique:
// - Gradient mesh background
// - Soft blur spots for depth
// - Consistent structure, unique personality
//
// Usage (in a page component):
//   <section className="relative overflow-hidden">
//     <div className={heroGradient.green.bg} />
//     <div className={heroGradient.green.spot1} />
//     <div className={heroGradient.green.spot2} />
//     <div className="relative">{content}</div>
//   </section>

// Homepage-style framing gradients (sides darker, middle lighter)
// Uses negative margins to position orbs outside viewport edges
export const heroGradient = {
  // Homepage & Get Started - Growth, success (brand primary)
  green: {
    bg: 'absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-100 to-blue-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-emerald-100 blur-xl',
    darkGlow1: 'bg-emerald-500/10',
    darkGlow2: 'bg-emerald-500/10',
  },

  // Services - Technical, professional
  teal: {
    bg: 'absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-blue-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-emerald-100 blur-xl',
    darkGlow1: 'bg-emerald-500/10',
    darkGlow2: 'bg-blue-500/10',
  },

  // Contact - Connection, communication
  blue: {
    bg: 'absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-blue-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-blue-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-blue-100 blur-xl',
    darkGlow1: 'bg-blue-500/10',
    darkGlow2: 'bg-blue-500/10',
  },

  // FAQ - Knowledge, wisdom
  purple: {
    bg: 'absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-purple-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-100 to-purple-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-purple-100 blur-xl',
    darkGlow1: 'bg-purple-500/10',
    darkGlow2: 'bg-purple-500/10',
  },

  // About - Personal, warm, approachable
  gold: {
    bg: 'absolute inset-0 bg-gradient-to-br from-gold-50 via-white to-gold-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-gold-100 to-gold-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-gold-100 to-gold-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-gold-100 blur-xl',
    darkGlow1: 'bg-gold-500/10',
    darkGlow2: 'bg-gold-500/10',
  },

  // Blog - Information, neutral, professional
  slate: {
    bg: 'absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-gray-100 to-slate-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-slate-100 blur-xl',
    darkGlow1: 'bg-slate-500/10',
    darkGlow2: 'bg-gray-500/10',
  },

  // Build/Shop - Creative, energetic
  rose: {
    bg: 'absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50/50',
    spot1: 'absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-purple-100 blur-3xl',
    spot2: 'absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-100 to-purple-100 blur-2xl',
    spot3: 'absolute top-20 left-1/4 w-32 h-32 rounded-full bg-purple-100 blur-xl',
    darkGlow1: 'bg-purple-500/10',
    darkGlow2: 'bg-purple-500/10',
  },
};

// Dark section glow presets (match hero gradients)
export const darkSectionGlow = {
  green: {
    glow1: 'absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2',
    glow2: 'absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3',
    dot: 'bg-emerald-400',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
  },
  teal: {
    glow1: 'absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2',
    glow2: 'absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3',
    dot: 'bg-emerald-400',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
  },
  blue: {
    glow1: 'absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2',
    glow2: 'absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3',
    dot: 'bg-blue-400',
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  purple: {
    glow1: 'absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2',
    glow2: 'absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3',
    dot: 'bg-purple-400',
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
  },
  gold: {
    glow1: 'absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2',
    glow2: 'absolute bottom-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3',
    dot: 'bg-gold-400',
    icon: 'text-gold-400',
    iconBg: 'bg-gold-500/20',
  },
};

// ============================================================================
// CSS ANIMATION KEYFRAMES - Add to globals.css
// ============================================================================
// Copy these to your globals.css if not already present:
//
// @keyframes slide-up {
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// }
//
// @keyframes scale-in {
//   from { opacity: 0; transform: scale(0.95); }
//   to { opacity: 1; transform: scale(1); }
// }
//
// .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
// .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
// .animate-delay-100 { animation-delay: 100ms; }
// .animate-delay-200 { animation-delay: 200ms; }
// .animate-delay-300 { animation-delay: 300ms; }
// .animate-delay-400 { animation-delay: 400ms; }
// .animate-delay-500 { animation-delay: 500ms; }

// Tailwind CSS Configuration
// Tailwind is a utility-first CSS framework
// Instead of writing CSS, you use pre-made classes like bg-blue-500, p-4, etc
// This config tells Tailwind where to look for files that use these classes

const config = {
  // ========================================================================
  // Dark Mode - Class-Based Toggle Support
  // ========================================================================
  // Allows manual dark mode toggle via .dark class on html element
  // Works with DarkModeToggle component for user control

  darkMode: 'class',

  // ========================================================================
  // Content - Which Files Use Tailwind?
  // ========================================================================
  // Tailwind scans these files for class names and only includes CSS for
  // the classes you actually use. Smart and efficient.
  // Like a vending machine - only stock the drinks people buy

  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],

  // ========================================================================
  // Safelist - Force Tailwind to Generate These Classes
  // ========================================================================
  // Classes in accentColors are built dynamically and not scanned by JIT.
  // This ensures Button and CircleBadge colors are always compiled.

  safelist: [
    // Backgrounds - light mode (bg-100)
    'bg-purple-100', 'bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-teal-100', 'bg-gray-100',

    // Text colors - light mode (text-700/800)
    'text-purple-700', 'text-blue-700', 'text-green-800', 'text-orange-800', 'text-teal-800', 'text-gray-700',

    // Border colors - light mode (border-500)
    'border-purple-500', 'border-blue-500', 'border-green-500', 'border-orange-500', 'border-teal-500', 'border-gray-500',

    // Border colors - dark mode (border-400)
    'dark:border-purple-400', 'dark:border-blue-400', 'dark:border-green-400', 'dark:border-orange-400', 'dark:border-teal-400', 'dark:border-gray-400',

    // Hover text colors
    'hover:text-purple-800', 'hover:text-blue-800', 'hover:text-green-900', 'hover:text-orange-900', 'hover:text-teal-900', 'hover:text-gray-800',

    // Hover border colors - light mode
    'hover:border-purple-600', 'hover:border-blue-600', 'hover:border-green-600', 'hover:border-orange-600', 'hover:border-teal-600', 'hover:border-gray-600',

    // Hover border colors - dark mode
    'dark:hover:border-purple-300', 'dark:hover:border-blue-300', 'dark:hover:border-green-300', 'dark:hover:border-orange-300', 'dark:hover:border-teal-300', 'dark:hover:border-gray-300',
  ],

  // ========================================================================
  // Theme - Customization
  // ========================================================================
  // Customize colors, spacing, fonts, and more

  theme: {
    extend: {
      // ======================================================================
      // Premium Color Palette - Synced with globals.css CSS variables
      // ======================================================================
      // Blues: Primary brand (20-25% of color usage)
      // Greens: Success & growth (2-5% of color usage)
      // Reds: Errors & critical (2-5% of color usage)
      // Yellows: Warnings & attention (1-3% of color usage)
      // Grays: Foundation & neutral (70-80% of interface)

      colors: {
        // ====================================================================
        // Blues - Primary Brand Identity
        // ====================================================================
        blue: {
          50: 'var(--blue-50)',
          100: 'var(--blue-100)',
          200: 'var(--blue-200)',
          300: 'var(--blue-300)',
          400: 'var(--blue-400)',
          500: 'var(--blue-500)',
          600: 'var(--blue-600)',
          700: 'var(--blue-700)',
          800: 'var(--blue-800)',
          900: 'var(--blue-900)',
        },

        // ====================================================================
        // Greens - Success & Growth States
        // ====================================================================
        green: {
          50: 'var(--green-50)',
          100: 'var(--green-100)',
          200: 'var(--green-200)',
          300: 'var(--green-300)',
          400: 'var(--green-400)',
          500: 'var(--green-500)',
          600: 'var(--green-600)',
          700: 'var(--green-700)',
          800: 'var(--green-800)',
          900: 'var(--green-900)',
        },

        // ====================================================================
        // Reds - Errors & Critical Actions
        // ====================================================================
        red: {
          50: 'var(--red-50)',
          100: 'var(--red-100)',
          200: 'var(--red-200)',
          300: 'var(--red-300)',
          400: 'var(--red-400)',
          500: 'var(--red-500)',
          600: 'var(--red-600)',
          700: 'var(--red-700)',
          800: 'var(--red-800)',
          900: 'var(--red-900)',
        },

        // ====================================================================
        // Yellows - Warnings & Attention
        // ====================================================================
        yellow: {
          50: 'var(--yellow-50)',
          100: 'var(--yellow-100)',
          200: 'var(--yellow-200)',
          300: 'var(--yellow-300)',
          400: 'var(--yellow-400)',
          500: 'var(--yellow-500)',
          600: 'var(--yellow-600)',
          700: 'var(--yellow-700)',
          800: 'var(--yellow-800)',
          900: 'var(--yellow-900)',
        },

        // ====================================================================
        // Oranges - Warm & Energetic
        // ====================================================================
        orange: {
          50: 'var(--orange-50)',
          100: 'var(--orange-100)',
          200: 'var(--orange-200)',
          300: 'var(--orange-300)',
          400: 'var(--orange-400)',
          500: 'var(--orange-500)',
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
          800: 'var(--orange-800)',
          900: 'var(--orange-900)',
        },

        // ====================================================================
        // Purples - Creativity & Premium
        // ====================================================================
        purple: {
          50: 'var(--purple-50)',
          100: 'var(--purple-100)',
          200: 'var(--purple-200)',
          300: 'var(--purple-300)',
          400: 'var(--purple-400)',
          500: 'var(--purple-500)',
          600: 'var(--purple-600)',
          700: 'var(--purple-700)',
          800: 'var(--purple-800)',
          900: 'var(--purple-900)',
        },

        // ====================================================================
        // Grayscale - Foundation & Neutral
        // ====================================================================
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },

        // ====================================================================
        // Teals - Secondary Accent
        // ====================================================================
        teal: {
          50: 'var(--teal-50)',
          100: 'var(--teal-100)',
          200: 'var(--teal-200)',
          300: 'var(--teal-300)',
          400: 'var(--teal-400)',
          500: 'var(--teal-500)',
          600: 'var(--teal-600)',
          700: 'var(--teal-700)',
          800: 'var(--teal-800)',
          900: 'var(--teal-900)',
        },

        // ====================================================================
        // Semantic Shortcuts
        // ====================================================================
        'primary': 'var(--color-primary)',
        'success': 'var(--color-success)',
        'danger': 'var(--color-danger)',
        'warning': 'var(--color-warning)',
      },

      // Add custom spacing values
      spacing: {
        // Example: h-gutter = 32px (instead of just Tailwind's defaults)
        // 'gutter': '2rem',
      },

      // Custom fonts - Inter for modern, trustworthy typography
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },

      // ======================================================================
      // Font Sizes - Scaled Up for Better Readability
      // ======================================================================
      // Body text (xs through 3xl): scaled up 10%
      // Large headings (4xl and up): scaled up 7.5% to keep hero sections balanced
      // Line heights adjusted proportionally to maintain comfortable reading
      fontSize: {
        'xs': ['0.825rem', { lineHeight: '1.1rem' }],
        'sm': ['0.9625rem', { lineHeight: '1.375rem' }],
        'base': ['1.1rem', { lineHeight: '1.65rem' }],
        'lg': ['1.2375rem', { lineHeight: '1.925rem' }],
        'xl': ['1.375rem', { lineHeight: '1.925rem' }],
        '2xl': ['1.65rem', { lineHeight: '2.2rem' }],
        '3xl': ['2.0625rem', { lineHeight: '2.475rem' }],
        '4xl': ['2.42rem', { lineHeight: '2.69rem' }],
        '5xl': ['3.225rem', { lineHeight: '1' }],
        '6xl': ['4.03rem', { lineHeight: '1' }],
        '7xl': ['4.84rem', { lineHeight: '1' }],
        '8xl': ['6.45rem', { lineHeight: '1' }],
        '9xl': ['8.6rem', { lineHeight: '1' }],
      },
    },
  },

  // ========================================================================
  // Plugins - Extended Functionality
  // ========================================================================
  // Install and use Tailwind plugins for extra features

  plugins: [],
};

module.exports = config;

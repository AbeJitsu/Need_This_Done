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

      // Custom fonts
      fontFamily: {
        // Example: font-display uses this custom font
        // 'display': ['Playfair Display', 'serif'],
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

// Tailwind CSS Configuration
// Tailwind is a utility-first CSS framework
// Instead of writing CSS, you use pre-made classes like bg-blue-500, p-4, etc
// This config tells Tailwind where to look for files that use these classes

const config = {
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
      // Add custom colors beyond Tailwind's defaults
      colors: {
        // Example: brand-blue can be used in classes like bg-brand-blue
        // 'brand-blue': '#0066cc',
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

// PostCSS Configuration
// PostCSS processes CSS before the browser sees it
// Think of it as a delivery service that:
// 1. Picks up your CSS
// 2. Adds browser-specific prefixes (so it works everywhere)
// 3. Processes Tailwind (converts classes to actual CSS)
// 4. Delivers the final CSS to the browser

const config = {
  plugins: {
    // Tailwind CSS - converts utility classes to actual CSS
    // Like: <div class="bg-blue-500"> becomes <div style="background-color: #3b82f6;">
    tailwindcss: {},

    // Autoprefixer - adds vendor prefixes for older browsers
    // Like: transform becomes -webkit-transform for Safari
    autoprefixer: {},
  },
};

module.exports = config;

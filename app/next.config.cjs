// Next.js Configuration
// This file controls how Next.js builds and runs your application
// Think of it as the "settings" for your kitchen

const nextConfig = {
  // ========================================================================
  // Output Mode: Standalone
  // ========================================================================
  // Packages everything needed to run into a single folder
  // Like pre-packaging meals so they only need heating, not cooking
  // Result: Faster Docker builds, smaller images, easier deployment
  output: 'standalone',

  // ========================================================================
  // Image Optimization
  // ========================================================================
  // Next.js automatically optimizes images for performance
  // Like a food photographing service - makes your dish look great
  images: {
    // Only load images from your own domain for security
    domains: [],

    // Cache images for 1 year (they don't change often)
    // Browsers download once, use forever
    formats: ['image/webp', 'image/avif'],
  },

  // ========================================================================
  // React Strict Mode
  // ========================================================================
  // Helps catch bugs during development (disabled in production)
  // Like a quality inspector checking everything twice
  reactStrictMode: true,

  // ========================================================================
  // Compression
  // ========================================================================
  // Enable compression for faster asset delivery
  compress: true,

  // ========================================================================
  // Headers for Security and Performance
  // ========================================================================
  // Add security headers to all responses
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;

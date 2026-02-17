// Next.js Configuration
// This file controls how Next.js builds and runs your application
// Think of it as the "settings" for your kitchen

const nextConfig = {
  // ========================================================================
  // Skip Pages Router Compatibility Layer
  // ========================================================================
  // We're using App Router only (no /pages directory)
  // Next.js still generates Pages Router files for compatibility, but we
  // prevent it from trying to export /404 and /500 by setting the build stage
  // to 'all' and letting the app router handle error pages
  experimental: {
    optimizePackageImports: ['@components', '@icons', '@ui'],
  },
  // Disable Pages Router file detection entirely since we use App Router
  // This prevents Next.js from trying to prerender built-in Pages Router error pages
  // which would attempt to import react-email HTML components at build time
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // ========================================================================
  // Server External Packages
  // ========================================================================
  // Prevent react-email packages from being bundled during page prerendering
  // React-email's Html component conflicts with next/document Html during
  // static analysis. Marking these as external keeps them server-only.
  serverExternalPackages: [
    '@react-email/components',
    '@react-email/render',
    'react-email',
  ],

  // ========================================================================
  // Webpack Configuration
  // ========================================================================
  // Ignore react-email during builds to prevent eval of Html component
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = [...(config.externals || []), 'react-email'];
    }
    return config;
  },

  // ========================================================================
  // Output Mode: Default (optimized for Vercel)
  // ========================================================================
  // Vercel has its own optimized build process and doesn't use Next.js 'standalone' mode
  // Using 'standalone' mode causes export errors with global-error.tsx, so we disable it
  // Vercel deployment configuration is specified in vercel.json instead

  // ========================================================================
  // Image Optimization
  // ========================================================================
  // Next.js automatically optimizes images for performance
  // Like a food photographing service - makes your dish look great
  images: {
    // Disable Next.js image optimization - serve images directly from Supabase
    // This bypasses the /_next/image API which is causing issues
    unoptimized: true,

    // Allowed external image hostnames
    domains: [
      'oxhjtmozsdstbokwtnwa.supabase.co',
      'images.unsplash.com',
    ],

    // Allowed remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oxhjtmozsdstbokwtnwa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
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
  // Redirects - Consolidate pages
  // ========================================================================
  // Redirect old pages to unified pricing page
  async redirects() {
    return [
      // Consolidated pages - merged into homepage
      {
        source: '/how-it-works',
        destination: '/',
        permanent: true,
      },
      // Removed pages - redirect to closest equivalent
      {
        source: '/get-started',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/changelog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/guide',
        destination: '/',
        permanent: true,
      },
      // Legacy routes
      {
        source: '/build',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/build/success',
        destination: '/pricing/success',
        permanent: true,
      },
    ];
  },

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

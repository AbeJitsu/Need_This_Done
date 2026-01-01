import { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo-config';

// ============================================================================
// Robots.txt Configuration
// ============================================================================
// Tells search engine crawlers which pages to index and which to skip.
// Next.js automatically serves this at /robots.txt

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',      // Admin dashboard - private
          '/api/',        // API routes - not for indexing
          '/dashboard/',  // User dashboard - private
          '/checkout/',   // Checkout flow - private
          '/cart/',       // Shopping cart - private
          '/auth/',       // Auth pages - private
          '/login/',      // Login page - private
        ],
      },
    ],
    sitemap: `${seoConfig.baseUrl}/sitemap.xml`,
  };
}

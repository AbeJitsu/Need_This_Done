import { MetadataRoute } from 'next';

// ============================================================================
// Dynamic Sitemap Generator
// ============================================================================
// Generates sitemap.xml for search engines to discover all pages.
// Next.js automatically serves this at /sitemap.xml

const BASE_URL = 'https://needthisdone.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages with their priorities and change frequencies
  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/get-started', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/changelog', priority: 0.5, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const now = new Date();

  return staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}

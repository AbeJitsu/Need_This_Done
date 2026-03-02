import { MetadataRoute } from 'next';
import { BlogPostSummary } from '@/lib/blog-types';
import { seoConfig } from '@/lib/seo-config';

// ============================================================================
// Dynamic Sitemap Generator
// ============================================================================
// Generates sitemap.xml for search engines to discover all pages.
// Next.js automatically serves this at /sitemap.xml
//
// What: Outputs all static pages plus dynamically fetched blog posts
// Why: Helps search engines discover and index all content
// How: Fetches published blog posts from API and merges with static pages

// ============================================================================
// Blog Post Fetching
// ============================================================================

async function getBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 3600 }, // Revalidate sitemap hourly
    });

    if (response.ok) {
      const data = await response.json();
      return data.posts as BlogPostSummary[];
    }
  } catch (error) {
    console.error('Sitemap: Failed to fetch blog posts:', error);
  }

  return [];
}

// ============================================================================
// Sitemap Generator
// ============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with their priorities and change frequencies
  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/work', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/resume', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/shop', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/build', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const now = new Date();

  // Build static page entries
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${seoConfig.baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Fetch and build blog post entries
  const blogPosts = await getBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${seoConfig.baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}

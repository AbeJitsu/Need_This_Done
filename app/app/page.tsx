import { getDefaultContent } from '@/lib/default-page-content';
import type { HomePageContent } from '@/lib/page-content-types';
import type { BlogPostSummary } from '@/lib/blog-types';
import HomePageClient from '@/components/home/HomePageClient';

// ============================================================================
// Home Page - NeedThisDone Landing Page
// ============================================================================
// The main landing page that introduces the service and invites visitors
// to learn more or submit a project request.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

// Use Incremental Static Regeneration (ISR) to pre-render and cache
// Regenerate the page every hour (3600 seconds)
export const revalidate = 3600;

export const metadata = {
  title: 'NeedThisDone - Get Your Projects Done Right',
  description: 'Professional web development, automation, and AI services. Custom websites from $500, workflow automation from $150, managed AI from $500/mo. Orlando-based, serving clients nationwide.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NeedThisDone - Get Your Projects Done Right',
    description: 'Professional web development, automation, and AI services. Custom websites, workflow automation, and managed AI solutions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'NeedThisDone - Get Your Projects Done Right',
    description: 'Professional web development, automation, and AI services. Custom websites, workflow automation, and managed AI solutions.',
  },
};

// ============================================================================
// Content Fetching
// ============================================================================

function getContent(): HomePageContent {
  return getDefaultContent('home') as HomePageContent;
}

// ============================================================================
// Recent Blog Posts (for homepage "Latest from the Blog" section)
// ============================================================================

async function getRecentBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      return (data.posts as BlogPostSummary[]).slice(0, 3);
    }
  } catch {
    // Silent fail — blog section just won't render
  }

  return [];
}

// ============================================================================
// Page Component
// ============================================================================

export default async function HomePage() {
  // Fetch repository content and recent blog posts in parallel.
  const [content, recentPosts] = await Promise.all([
    getContent(),
    getRecentBlogPosts(),
  ]);

  // Render using the client component which supports inline editing
  return <HomePageClient content={content} recentBlogPosts={recentPosts} />;
}

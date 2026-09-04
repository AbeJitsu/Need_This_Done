import { Suspense } from 'react';
import { getDefaultContent } from '@/lib/default-page-content';
import type { BlogPageContent } from '@/lib/page-content-types';
import BlogPageClient from '@/components/blog/BlogPageClient';
import { listBlogPosts } from '@/lib/blog-content';

export const dynamic = 'force-static';

// ============================================================================
// Blog Page - Public Blog Listing
// ============================================================================
// Displays all published blog posts in a clean, scannable layout.
// Features the most recent post prominently, then shows others in a grid.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Insights | NeedThisDone',
  description:
    'Insights for owners and founders turning a vision for something better into a clear next move.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Insights | NeedThisDone',
    description: 'Insights for owners and founders turning a vision for something better into a clear next move.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Insights | NeedThisDone',
    description: 'Insights for owners and founders turning a vision for something better into a clear next move.',
  },
};

// ============================================================================
// Content Fetching
// ============================================================================

function getContent(): BlogPageContent {
  return getDefaultContent('blog') as BlogPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default function BlogPage() {
  const content = getContent();
  const posts = listBlogPosts();

  return (
    <Suspense>
      <BlogPageClient initialContent={content} posts={posts} />
    </Suspense>
  );
}

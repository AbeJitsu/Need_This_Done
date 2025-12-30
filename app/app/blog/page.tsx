import { getDefaultContent } from '@/lib/default-page-content';
import type { BlogPageContent } from '@/lib/page-content-types';
import { BlogPostSummary } from '@/lib/blog-types';
import BlogPageClient from '@/components/blog/BlogPageClient';

export const dynamic = 'force-dynamic';

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
  title: 'Blog - NeedThisDone',
  description:
    'Tips, insights, and behind-the-scenes looks at how we help busy professionals get things done.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<BlogPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/blog`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as BlogPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch blog content:', error);
  }

  return getDefaultContent('blog') as BlogPageContent;
}

async function getBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.posts as BlogPostSummary[];
    }
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
  }

  return [];
}

// ============================================================================
// Page Component
// ============================================================================

export default async function BlogPage() {
  const [content, posts] = await Promise.all([getContent(), getBlogPosts()]);

  return <BlogPageClient initialContent={content} posts={posts} />;
}

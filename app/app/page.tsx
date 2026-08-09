import { getDefaultContent } from '@/lib/default-page-content';
import type { HomePageContent } from '@/lib/page-content-types';
import HomePageClient from '@/components/home/HomePageClient';
import { listBlogPosts } from '@/lib/blog-content';

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
  title: 'NeedThisDone | Website Improvement & Managed AI Operator',
  description: 'Choose a $500 website audit plus one contained fix, or a proposal-based 30-day managed AI operator pilot with weekly briefs.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NeedThisDone | Website Improvement & Managed AI Operator',
    description: 'Two human-led offers: a contained website fix or a supervised operator pilot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'NeedThisDone | Website Improvement & Managed AI Operator',
    description: 'Two human-led offers: a contained website fix or a supervised operator pilot.',
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

// ============================================================================
// Page Component
// ============================================================================

export default function HomePage() {
  const content = getContent();
  const recentPosts = listBlogPosts().slice(0, 3);

  // Render using the client component which supports inline editing
  return <HomePageClient content={content} recentBlogPosts={recentPosts} />;
}

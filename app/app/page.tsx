import { getDefaultContent } from '@/lib/default-page-content';
import type { HomePageContent } from '@/lib/page-content-types';
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

async function getContent(): Promise<HomePageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/home`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as HomePageContent;
    }
  } catch (error) {
    console.error('Failed to fetch home content:', error);
  }

  return getDefaultContent('home') as HomePageContent;
}

// ============================================================================
// Prefetch Products (for instant navigation)
// ============================================================================
// Warms the cache so /pricing loads instantly when users click CTAs

async function prefetchProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Fire-and-forget fetch to warm Redis cache
    await fetch(`${baseUrl}/api/shop/products`, {
      next: { revalidate: 3600 }, // Match product cache TTL
    });
  } catch {
    // Silent fail - prefetch is optional optimization
  }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function HomePage() {
  // Fetch content and prefetch products in parallel for speed
  const [content] = await Promise.all([
    getContent(),
    prefetchProducts(), // Warms cache for instant /pricing navigation
  ]);

  // Render using the client component which supports inline editing
  return <HomePageClient content={content} />;
}

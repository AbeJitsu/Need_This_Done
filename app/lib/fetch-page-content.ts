import { getDefaultContent } from '@/lib/default-page-content';

// ============================================================================
// Page Content Fetching Utility
// ============================================================================
// Centralizes the pattern of fetching page content from the API with fallback
// to defaults. Previously duplicated across 4+ page files.
//
// Usage:
//   const content = await fetchPageContent<PrivacyPageContent>('privacy');

type PageSlug = 'privacy' | 'terms' | 'guide' | 'faq' | 'home' | 'services' | 'pricing' | 'how-it-works' | 'contact' | 'blog' | 'login';

/**
 * Fetches page content from the API with automatic fallback to defaults.
 *
 * @param slug - The page slug (e.g., 'privacy', 'terms', 'faq')
 * @param revalidate - Cache revalidation time in seconds (default: 60)
 * @returns The page content, either from API or defaults
 */
export async function fetchPageContent<T>(
  slug: PageSlug,
  revalidate: number = 60
): Promise<T> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/${slug}`, {
      next: { revalidate },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as T;
    }
  } catch (error) {
    console.error(`Failed to fetch ${slug} content:`, error);
  }

  return getDefaultContent(slug) as T;
}

import posts from '@/content/blog-posts.json';
import type { BlogPost, BlogPostSummary } from '@/lib/blog-types';

// Each repository-owned post was reviewed on 2026-08-08. These three remain
// useful to the two current offers; the other six resolve to the Insights hub
// rather than continuing to imply a broader product or a current service.
export const RETAINED_POST_SLUGS = new Set([
  'ai-context-budget-tips',
  'loading-tricks-feel-instant',
  'rewriting-copy-plain-language',
]);

const publishedPosts = (posts as BlogPost[])
  .filter((post) => post.status === 'published' && RETAINED_POST_SLUGS.has(post.slug))
  .sort((left, right) =>
    (right.published_at || '').localeCompare(left.published_at || ''),
  );

const WORK_REDIRECTS = new Set([
  'combat-medic-to-code-military-discipline-development',
  'combat-medic-to-developer-skills-transfer',
  'self-taught-to-full-stack',
]);

const INSIGHTS_REDIRECTS = new Set([
  'polish-day',
  'auto-cycling-showcases-phase-rotation-react',
  'building-device-mockup-preview-tool',
  'easter-egg-nobody-will-find',
  'glassmorphism-that-actually-works',
  'why-polish-days-are-productive',
]);

const SERVICES_REDIRECTS = new Set([
  'rag-supabase-pgvector-nextjs-tutorial',
  'nextjs-medusa-headless-commerce-setup-guide',
  'custom-stripe-checkout-nextjs-server-actions',
  'nextjs-typescript-ecommerce-system-design',
  'why-i-built-my-own-ecommerce-platform',
]);

export function listBlogPosts(): BlogPostSummary[] {
  return publishedPosts;
}

export function getBlogPost(slug: string): BlogPost | null {
  return publishedPosts.find((post) => post.slug === slug) || null;
}

export function getRelatedBlogPosts(
  currentSlug: string,
  category: string | null,
): BlogPostSummary[] {
  return publishedPosts
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, 3);
}

export function getRetiredBlogDestination(slug: string): '/work' | '/services' | '/blog' {
  if (WORK_REDIRECTS.has(slug)) return '/work';
  if (SERVICES_REDIRECTS.has(slug)) return '/services';
  if (INSIGHTS_REDIRECTS.has(slug)) return '/blog';
  return '/blog';
}

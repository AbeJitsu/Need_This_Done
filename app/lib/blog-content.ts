import posts from '@/content/blog-posts.json';
import type { BlogPost, BlogPostSummary } from '@/lib/blog-types';

const publishedPosts = (posts as BlogPost[])
  .filter((post) => post.status === 'published')
  .sort((left, right) =>
    (right.published_at || '').localeCompare(left.published_at || ''),
  );

const ABOUT_REDIRECTS = new Set([
  'combat-medic-to-code-military-discipline-development',
  'combat-medic-to-developer-skills-transfer',
  'self-taught-to-full-stack',
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

export function getRetiredBlogDestination(slug: string): '/about' | '/services' | '/blog' {
  if (ABOUT_REDIRECTS.has(slug)) return '/about';
  if (SERVICES_REDIRECTS.has(slug)) return '/services';
  return '/blog';
}

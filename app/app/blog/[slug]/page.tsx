import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import MarkdownContent from '@/components/blog/MarkdownContent';
import BlogPostCTA from '@/components/blog/BlogPostCTA';
import RelatedPosts from '@/components/blog/RelatedPosts';
import {
  BlogPost,
  BlogPostSummary,
  formatPublishedDate,
  calculateReadingTime,
  BLOG_CATEGORIES,
} from '@/lib/blog-types';
import { BlogPostingJsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';

// ============================================================================
// Category accent colors for the dark hero — full class strings for Tailwind
// ============================================================================

const CATEGORY_ACCENTS: Record<string, {
  badge: string;
  bar: string;
}> = {
  tutorials: {
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    bar: 'from-emerald-400 to-emerald-600',
  },
  guides: {
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    bar: 'from-blue-400 to-blue-600',
  },
  case_studies: {
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    bar: 'from-amber-400 to-amber-600',
  },
  news: {
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    bar: 'from-purple-400 to-purple-600',
  },
  tips: {
    badge: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    bar: 'from-gray-400 to-gray-600',
  },
};

const DEFAULT_ACCENT = CATEGORY_ACCENTS.news;

// ============================================================================
// Metadata Generation
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found - NeedThisDone',
    };
  }

  return {
    title: `${post.meta_title || post.title} - NeedThisDone Blog`,
    description: post.meta_description || post.excerpt || undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

// ============================================================================
// Content Fetching
// ============================================================================

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.post as BlogPost;
    }
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
  }

  return null;
}

// ============================================================================
// Related Posts — same category, excluding current post
// ============================================================================

async function getRelatedPosts(
  currentSlug: string,
  category: string | null,
): Promise<BlogPostSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = category
      ? `${baseUrl}/api/blog?category=${encodeURIComponent(category)}`
      : `${baseUrl}/api/blog`;
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (response.ok) {
      const data = await response.json();
      const posts = (data.posts as BlogPostSummary[]).filter(
        (p) => p.slug !== currentSlug,
      );
      return posts.slice(0, 3);
    }
  } catch (error) {
    console.error('Failed to fetch related posts:', error);
  }

  return [];
}

// ============================================================================
// Page Component
// ============================================================================

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const categoryLabel = post.category
    ? BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES] || post.category
    : null;
  const accent = CATEGORY_ACCENTS[post.category || ''] || DEFAULT_ACCENT;
  const relatedPosts = await getRelatedPosts(slug, post.category);

  return (
    <>
      <BlogPostingJsonLd post={post} />
      <div>
        {/* ================================================================
            Dark Editorial Hero
            ================================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Glow orbs */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>

            {/* Editorial bar + category */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${accent.bar}`} />
              {categoryLabel && (
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${accent.badge}`}
                >
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-8">
              {post.title}
            </h1>

            {/* Author + date + reading time strip */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Author avatar */}
              {post.author_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-300 font-medium">{post.author_name}</span>
                </div>
              )}

              {post.author_name && post.published_at && (
                <span className="text-slate-600">·</span>
              )}

              {post.published_at && (
                <span className="text-slate-400">
                  {formatPublishedDate(post.published_at)}
                </span>
              )}

              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{readingTime} min read</span>
            </div>
          </div>
        </section>

        {/* ================================================================
            Featured Image — bridging banner
            ================================================================ */}
        {post.featured_image && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 -mt-8">
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                unoptimized
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* ================================================================
            Article Content — narrower for reading comfort
            ================================================================ */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12">
          <MarkdownContent content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Source Attribution */}
          {post.source && post.source !== 'original' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Originally shared on{' '}
                {post.source_url ? (
                  <a
                    href={post.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {post.source.charAt(0).toUpperCase() + post.source.slice(1)}
                  </a>
                ) : (
                  <span className="font-medium">
                    {post.source.charAt(0).toUpperCase() + post.source.slice(1)}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Related Posts — internal cross-linking for SEO */}
          <RelatedPosts
            posts={relatedPosts}
            categoryLabel={categoryLabel || undefined}
          />

          {/* CTA */}
          <BlogPostCTA />
        </article>
      </div>
    </>
  );
}

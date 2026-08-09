import { permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import MarkdownContent from '@/components/blog/MarkdownContent';
import BlogPostCTA from '@/components/blog/BlogPostCTA';
import RelatedPosts from '@/components/blog/RelatedPosts';
import {
  formatPublishedDate,
  calculateReadingTime,
  BLOG_CATEGORIES,
} from '@/lib/blog-types';
import {
  getBlogPost,
  getRelatedBlogPosts,
  getRetiredBlogDestination,
  listBlogPosts,
} from '@/lib/blog-content';
import { BlogPostingJsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-static';

// ============================================================================
// Category accent colors for the reading hero — full class strings for Tailwind
// ============================================================================

const CATEGORY_ACCENTS: Record<string, {
  badge: string;
  bar: string;
}> = {
  tutorial: {
    badge: 'bg-[#eeeaf9] border-[#6d58a5]/20 text-[#6d58a5]',
    bar: 'from-[#d9b96e] to-[#a16a24]',
  },
  'case-study': {
    badge: 'bg-[#fbf0d4] border-[#d9b96e]/30 text-[#7a5b20]',
    bar: 'from-[#d9b96e] to-[#a16a24]',
  },
  'behind-the-scenes': {
    badge: 'bg-[#e3edf0] border-[#286274]/20 text-[#286274]',
    bar: 'from-[#8ed3ac] to-[#286274]',
  },
  news: {
    badge: 'bg-[#eeeaf9] border-[#6d58a5]/20 text-[#6d58a5]',
    bar: 'from-[#b8d9c7] to-[#126b4e]',
  },
  tips: {
    badge: 'bg-[#e4eee6] border-emerald-900/15 text-[#126b4e]',
    bar: 'from-[#8ed3ac] to-[#126b4e]',
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
// Repository-owned content and retirement redirects
// ============================================================================

export function generateStaticParams() {
  return listBlogPosts().map(({ slug }) => ({ slug }));
}

// ============================================================================
// Page Component
// ============================================================================

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    permanentRedirect(getRetiredBlogDestination(slug));
  }

  const readingTime = calculateReadingTime(post.content);
  const categoryLabel = post.category
    ? BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES] || post.category
    : null;
  const accent = CATEGORY_ACCENTS[post.category || ''] || DEFAULT_ACCENT;
  const relatedPosts = getRelatedBlogPosts(slug, post.category);

  return (
    <>
      <BlogPostingJsonLd post={post} />
      <div className="bg-[#f7f4ed]">
        {/* ================================================================
            Reading Hero
            ================================================================ */}
        <section className="relative overflow-hidden border-b border-[#183229]/10 bg-[#18372e] text-white">
          <div className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-56 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
            {/* Back link */}
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-emerald-50/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18372e]"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>

            {/* Editorial bar + category */}
            <div className="mb-6 flex items-center gap-3">
              <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${accent.bar}`} />
              {categoryLabel && (
                <span
                    className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${accent.badge}`}
                >
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-8 max-w-4xl font-playfair text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
              {post.title}
            </h1>

            {/* Author + date + reading time strip */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-50/70">
              {/* Author avatar */}
              {post.author_name && (
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-300 text-sm font-bold text-[#18372e]">
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white">{post.author_name}</span>
                </div>
              )}

              {post.author_name && post.published_at && (
                <span className="text-emerald-50/35">·</span>
              )}

              {post.published_at && (
                <span>
                  {formatPublishedDate(post.published_at)}
                </span>
              )}

              <span className="text-emerald-50/35">·</span>
              <span>{readingTime} min read</span>
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
        <article className="mx-auto max-w-3xl bg-[#f7f4ed] px-4 py-14 sm:px-6 md:py-20">
          <MarkdownContent content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 border-t border-[#183229]/10 pt-8">
              <h3 className="mb-3 text-sm font-bold text-[#50675e]">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="rounded-full bg-white px-3 py-1 text-sm text-[#50675e] ring-1 ring-[#183229]/10 transition-colors hover:bg-[#e4eee6] hover:text-[#126b4e]"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Source Attribution */}
          {post.source && post.source !== 'original' && (
            <div className="mt-8 border-t border-[#183229]/10 pt-6">
              <p className="text-sm text-[#50675e]">
                Originally shared on{' '}
                {post.source_url ? (
                  <a
                    href={post.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#126b4e] hover:underline"
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

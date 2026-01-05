import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import Button from '@/components/Button';
import MarkdownContent from '@/components/blog/MarkdownContent';
import {
  BlogPost,
  formatPublishedDate,
  calculateReadingTime,
  BLOG_CATEGORIES,
} from '@/lib/blog-types';
import {
  headingColors,
  formInputColors,
  accentColors,
  cardBgColors,
  cardBorderColors,
  focusRingClasses,
  mutedTextColors,
  hoverBgColors,
  dividerColors,
  coloredLinkText,
} from '@/lib/colors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Single Blog Post Page - /blog/[slug]
// ============================================================================
// Displays a full blog post with rich formatting, author info, and sharing.
// Supports both plain text content and future Puck-based rich layouts.

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
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
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

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/blog"
        className={`
          inline-flex items-center gap-2 mb-8 rounded
          ${formInputColors.helper} hover:${headingColors.primary}
          transition-colors ${focusRingClasses.blue}
        `}
      >
        ← Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Category */}
        {categoryLabel && (
          <div className="mb-4">
            <span
              className={`
                inline-block px-3 py-1 text-sm font-semibold rounded-full
                ${accentColors.blue.bg} ${accentColors.blue.text}
              `}
            >
              {categoryLabel}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className={`
            text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight
            ${headingColors.primary} mb-6
          `}
        >
          {post.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Author */}
          {post.author_name && (
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${accentColors.purple.bg} ${accentColors.purple.text} font-bold
                `}
              >
                {post.author_name.charAt(0).toUpperCase()}
              </div>
              <span className={headingColors.secondary}>{post.author_name}</span>
            </div>
          )}

          {/* Separator */}
          {post.author_name && post.published_at && (
            <span className={`${mutedTextColors.light}`}>•</span>
          )}

          {/* Date */}
          {post.published_at && (
            <span className={formInputColors.helper}>
              {formatPublishedDate(post.published_at)}
            </span>
          )}

          {/* Reading Time */}
          <span className={mutedTextColors.light}>•</span>
          <span className={formInputColors.helper}>{readingTime} min read</span>
        </div>
      </header>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content - renders markdown with syntax highlighting */}
      <MarkdownContent content={post.content} />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className={`mt-12 pt-8 border-t ${dividerColors.border}`}>
          <h3 className={`text-sm font-semibold ${headingColors.secondary} mb-3`}>
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className={`
                  px-3 py-1 rounded-full text-sm
                  ${cardBgColors.elevated}
                  ${mutedTextColors.normal}
                  ${hoverBgColors.purple}
                  transition-colors ${focusRingClasses.blue}
                `}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Source Attribution */}
      {post.source && post.source !== 'original' && (
        <div className={`mt-8 pt-6 border-t ${dividerColors.border}`}>
          <p className={`text-sm ${formInputColors.helper}`}>
            Originally shared on{' '}
            {post.source_url ? (
              <a
                href={post.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${coloredLinkText.blue} hover:underline`}
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

      {/* CTA Section */}
      <div
        className={`
          mt-12 p-8 rounded-xl text-center
          ${cardBgColors.base} ${cardBorderColors.subtle}
        `}
      >
        <h3 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
          Need Help Getting Things Done?
        </h3>
        <p className={`${formInputColors.helper} mb-6 max-w-lg mx-auto`}>
          Whether it's a project you've been putting off or ongoing support you need,
          we're here to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="gold" href="/get-started" size="lg">
            Get Started
          </Button>
          <Button variant="gray" href="/services" size="lg">
            View Services
          </Button>
        </div>
      </div>
    </article>
  );
}

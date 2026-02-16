// ============================================================================
// BlogPostCard Component - Reusable Blog Post Preview Card
// ============================================================================
// Displays a blog post summary with image, title, excerpt, and metadata.
// Used on listing pages and anywhere post previews are needed.

import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/Card';
import { BlogPostSummary, formatPublishedDate, BLOG_CATEGORIES } from '@/lib/blog-types';
import { headingColors, formInputColors, accentColors } from '@/lib/colors';
// Note: Using 'group-hover:text-accent-blue' directly because Tailwind's class purging
// requires full class names to be visible at build time (can't use template interpolation)

interface BlogPostCardProps {
  post: BlogPostSummary;
  /** Featured style for hero posts */
  featured?: boolean;
}

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const categoryLabel = post.category
    ? BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES] || post.category
    : null;

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card hoverColor="blue" hoverEffect="lift" className={featured ? 'p-0 overflow-hidden' : ''}>
        <div className={featured ? 'md:flex' : ''}>
          {/* Featured Image */}
          {post.featured_image && (
            <div
              className={`
                relative overflow-hidden rounded-lg
                ${featured ? 'md:w-1/2 h-48 md:h-auto md:rounded-l-xl md:rounded-r-none' : 'h-48 mb-4'}
              `}
            >
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          {/* Content */}
          <div className={featured ? 'p-6 md:w-1/2 flex flex-col justify-center' : ''}>
            {/* Category Badge */}
            {categoryLabel && (
              <div className="mb-3">
                <span
                  className={`
                    inline-block px-3 py-1 text-xs font-semibold rounded-full
                    ${accentColors.blue.bg} ${accentColors.blue.text}
                  `}
                >
                  {categoryLabel}
                </span>
              </div>
            )}

            {/* Title */}
            <h2
              className={`
                ${featured ? 'text-2xl' : 'text-xl'} font-bold mb-2
                ${headingColors.primary}
                group-hover:text-accent-blue transition-colors
              `}
            >
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className={`${formInputColors.helper} mb-4 line-clamp-3`}>{post.excerpt}</p>
            )}

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Author */}
              {post.author_name && (
                <span className={formInputColors.helper}>By {post.author_name}</span>
              )}

              {/* Date */}
              {post.published_at && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className={formInputColors.helper}>
                    {formatPublishedDate(post.published_at)}
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`
                      text-xs px-2 py-1 rounded
                      bg-gray-100 dark:bg-gray-700
                      text-gray-600 dark:text-gray-300
                    `}
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

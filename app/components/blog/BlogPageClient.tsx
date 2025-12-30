'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { EditableSection } from '@/components/InlineEditor';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { BlogPageContent } from '@/lib/page-content-types';
import { BlogPostSummary, BLOG_CATEGORIES } from '@/lib/blog-types';
import { headingColors, formInputColors, accentColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Blog Page Client - Inline Editable Version
// ============================================================================
// What: Client component for blog listing page with inline editing support
// Why: Allows admin users to edit static content (header, empty state, titles)
// How: Uses useEditableContent hook + EditableSection wrappers

interface BlogPageClientProps {
  initialContent: BlogPageContent;
  posts: BlogPostSummary[];
}

export default function BlogPageClient({ initialContent, posts }: BlogPageClientProps) {
  // Inline editing hook - auto-detects slug from URL
  const { content } = useEditableContent<BlogPageContent>(initialContent);

  // Separate featured (most recent) from the rest
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {posts.length === 0 ? (
        /* Empty State */
        <EditableSection sectionKey="emptyState" label="Empty State">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{content.emptyState.emoji}</div>
            <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
              {content.emptyState.title}
            </h2>
            <p className={`${formInputColors.helper} max-w-md mx-auto`}>
              {content.emptyState.description}
            </p>
          </div>
        </EditableSection>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <section className="mb-12">
              <BlogPostCard post={featuredPost} featured />
            </section>
          )}

          {/* Category Filter (if we have posts) */}
          {otherPosts.length > 0 && (
            <section className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  href="/blog"
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${accentColors.gray.bg} ${accentColors.gray.text}
                    hover:opacity-80 ${focusRingClasses.blue}
                  `}
                >
                  {content.categoryFilterLabel}
                </Link>
                {Object.entries(BLOG_CATEGORIES).slice(0, 5).map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/blog?category=${key}`}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors
                      bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                      hover:bg-gray-200 dark:hover:bg-gray-700 ${focusRingClasses.blue}
                    `}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Post Grid */}
          {otherPosts.length > 0 && (
            <EditableSection sectionKey="morePostsTitle" label="More Posts Title">
              <section>
                <h2 className={`text-2xl font-bold ${headingColors.primary} mb-6`}>
                  {content.morePostsTitle}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            </EditableSection>
          )}
        </>
      )}
    </div>
  );
}

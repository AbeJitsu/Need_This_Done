'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { EditableSection } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { BlogPageContent } from '@/lib/page-content-types';
import { BlogPostSummary, BLOG_CATEGORIES } from '@/lib/blog-types';
import { headingColors, formInputColors, accentColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Blog Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection wrappers provide click-to-select functionality.

interface BlogPageClientProps {
  initialContent: BlogPageContent;
  posts: BlogPostSummary[];
}

export default function BlogPageClient({ initialContent, posts }: BlogPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'header' in pageContent && 'emptyState' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as BlogPageContent) : initialContent;

  // Separate featured (most recent) from the rest
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Centered gradient like homepage
          ================================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="relative overflow-hidden py-8">
            {/* Gradient orbs - left color → white middle → right color */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-100 to-gold-100 blur-2xl" />

            {/* Content */}
            <div className="relative z-10">
              <EditableSection sectionKey="header" label="Page Header">
                <PageHeader
                  title={content.header.title}
                  description={content.header.description}
                  color="purple"
                />
              </EditableSection>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Main Content Section - White background
          ================================================================ */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {posts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{content.emptyState.emoji}</div>
              <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
                {content.emptyState.title}
              </h2>
              <p className={`${formInputColors.helper} max-w-md mx-auto`}>
                {content.emptyState.description}
              </p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <div className="mb-12">
                  <BlogPostCard post={featuredPost} featured />
                </div>
              )}

              {/* Category Filter (if we have posts) */}
              {otherPosts.length > 0 && (
                <div className="mb-8">
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
                </div>
              )}

              {/* Post Grid */}
              {otherPosts.length > 0 && (
                <div>
                  <h2 className={`text-2xl font-bold ${headingColors.primary} mb-6`}>
                    {content.morePostsTitle}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

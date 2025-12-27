import PageHeader from '@/components/PageHeader';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { BlogPostSummary, BLOG_CATEGORIES } from '@/lib/blog-types';
import { headingColors, formInputColors, accentColors } from '@/lib/colors';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ============================================================================
// Blog Page - Public Blog Listing
// ============================================================================
// Displays all published blog posts in a clean, scannable layout.
// Features the most recent post prominently, then shows others in a grid.

export const metadata = {
  title: 'Blog - NeedThisDone',
  description:
    'Tips, insights, and behind-the-scenes looks at how we help busy professionals get things done.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.posts as BlogPostSummary[];
    }
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
  }

  return [];
}

// ============================================================================
// Page Component
// ============================================================================

export default async function BlogPage() {
  const posts = await getBlogPosts();

  // Separate featured (most recent) from the rest
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="Blog"
        description="Tips, insights, and behind-the-scenes looks at how we help busy professionals get things done."
      />

      {posts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
            Coming Soon
          </h2>
          <p className={`${formInputColors.helper} max-w-md mx-auto`}>
            We're working on some great content for you. Check back soon for tips,
            insights, and stories about getting things done.
          </p>
        </div>
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
                    hover:opacity-80
                  `}
                >
                  All Posts
                </Link>
                {Object.entries(BLOG_CATEGORIES).slice(0, 5).map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/blog?category=${key}`}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors
                      bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                      hover:bg-gray-200 dark:hover:bg-gray-700
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
            <section>
              <h2 className={`text-2xl font-bold ${headingColors.primary} mb-6`}>
                More Posts
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

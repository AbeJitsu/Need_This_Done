import BlogPostCard from '@/components/blog/BlogPostCard';
import type { BlogPostSummary } from '@/lib/blog-types';

// ============================================================================
// Related Posts Section
// ============================================================================
// Renders 3 related posts below blog content to create internal cross-links.
// This keeps readers on-site and distributes link equity between posts.

interface RelatedPostsProps {
  posts: BlogPostSummary[];
  categoryLabel?: string;
}

export default function RelatedPosts({ posts, categoryLabel }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  const heading = categoryLabel
    ? `More in ${categoryLabel}`
    : 'Keep Reading';

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

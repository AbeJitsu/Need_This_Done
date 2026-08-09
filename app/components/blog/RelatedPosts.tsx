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
  <section className="mt-16 border-t border-[#183229]/10 pt-12">
      <h2 className="mb-8 font-playfair text-3xl font-black text-[#183229]">{heading}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

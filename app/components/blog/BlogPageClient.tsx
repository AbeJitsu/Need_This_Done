import BlogPostCard from "@/components/blog/BlogPostCard";
import PublicClosing from "@/components/public/PublicClosing";
import type { BlogPageContent } from "@/lib/page-content-types";
import type { BlogPostSummary } from "@/lib/blog-types";

export default function BlogPageClient({
  initialContent,
  posts,
}: {
  initialContent: BlogPageContent;
  posts: BlogPostSummary[];
}) {
  return (
    <main
      id="main-content"
      className="pf-page studio-notes bg-[var(--public-cream)] text-[var(--public-ink)]"
    >
      <section className="pf-page-intro pf-wrap">
        <p className="pf-eyebrow"><span /> Notes from the build</p>
        <h1>Thinking out loud.<br /><em>Making it useful.</em></h1>
        <p className="pf-lead">
          Short notes on interfaces, clearer communication, and practical
          development decisions. Another way to see how I approach the work.
        </p>
      </section>
      <section className="public-section" aria-label="All notes">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">Engineering notes</p>
            <h2 className="studio-title">Thinking through the work.</h2>
          </div>
          <span className="studio-index">{posts.length} notes</span>
        </div>
        {posts.length ? (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="md:col-span-2">
              <BlogPostCard post={posts[0]} featured showImage={false} />
            </div>
            {posts.slice(1).map((post) => (
              <BlogPostCard key={post.id} post={post} showImage={false} />
            ))}
          </div>
        ) : (
          <p>{initialContent.emptyState.description}</p>
        )}
      </section>
      <PublicClosing title="Have a question of your own?">
        <p>
          Reach out about the work, a development role, or a question worth
          exploring together.
        </p>
      </PublicClosing>
    </main>
  );
}

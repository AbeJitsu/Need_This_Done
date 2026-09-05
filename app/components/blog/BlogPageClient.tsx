import BlogPostCard from '@/components/blog/BlogPostCard';
import PublicClosing from '@/components/public/PublicClosing';
import type { BlogPageContent } from '@/lib/page-content-types';
import type { BlogPostSummary } from '@/lib/blog-types';

export default function BlogPageClient({ initialContent, posts }: { initialContent: BlogPageContent; posts: BlogPostSummary[] }) {
  return <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
    <section className="bg-[var(--public-dark)] text-white">
      <div className="public-section">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">Insights</p>
        <h1 className="mt-5 max-w-3xl font-playfair text-5xl font-black sm:text-6xl">Ideas you can put to use.</h1>
        <p className="public-reading mt-6 text-lg leading-8 text-[#dce8dd]">{initialContent.header.description}</p>
      </div>
    </section>
    <section className="public-section" aria-label="All articles">
      {posts.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map(post => <BlogPostCard key={post.id} post={post} />)}</div> : <p>{initialContent.emptyState.description}</p>}
    </section>
    <PublicClosing title="Have a question of your own?">
      <p>Share the website change or working day you have in mind. We can discuss a useful next step.</p>
    </PublicClosing>
  </main>;
}

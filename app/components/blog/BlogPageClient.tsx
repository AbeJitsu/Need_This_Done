'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { ContentSection } from '@/components/content/ContentStructure';
import type { BlogPageContent } from '@/lib/page-content-types';
import { BLOG_CATEGORIES, type BlogPostSummary } from '@/lib/blog-types';

interface BlogPageClientProps {
  initialContent: BlogPageContent;
  posts: BlogPostSummary[];
}

function categoryLabel(category: string) {
  return BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES]
    || category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function BlogPageClient({ initialContent, posts }: BlogPageClientProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const categoryCountMap = new Map<string, number>();
  for (const post of posts) {
    if (post.category) {
      categoryCountMap.set(post.category, (categoryCountMap.get(post.category) || 0) + 1);
    }
  }

  const activeCategories = [...categoryCountMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category]) => category);

  const filteredPosts = activeCategory
    ? posts.filter((post) => post.category === activeCategory)
    : posts;
  const [featuredPost, ...otherPosts] = filteredPosts;
  const noteCountLabel = `${filteredPosts.length} ${filteredPosts.length === 1 ? 'note' : 'notes'}`;

  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="relative overflow-hidden border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-56 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12">
          <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <ContentSection sectionKey="header" label="Page Header">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Insights
                </p>
                <h1 className="mt-6 max-w-3xl font-playfair text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
                  Make the next step <span className="text-emerald-300">clearer.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75 md:text-xl">
                  {initialContent.header.description}
                </p>
              </div>
            </ContentSection>

            <aside className="rounded-[2rem] border border-white/15 bg-white/[.08] p-6 backdrop-blur-sm sm:p-8" aria-labelledby="reading-filter-heading">
              <div className="flex items-center gap-3 text-emerald-200">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-[#18372e]">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[.2em]">A useful reading filter</p>
              </div>
              <h2 id="reading-filter-heading" className="mt-6 font-playfair text-3xl font-black">Look for the handoff.</h2>
              <p className="mt-3 leading-7 text-emerald-50/70">
                The most useful note usually makes one part of the work easier to see.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  ['01', 'What is unclear?'],
                  ['02', 'What result matters?'],
                  ['03', 'What is the next decision?'],
                ].map(([number, question]) => (
                  <div key={number} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <span className="text-xs font-bold text-emerald-300">{number}</span>
                    <p className="mt-3 text-sm font-bold leading-5 text-white">{question}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {posts.length > 0 && (
            <nav className="mt-12 flex flex-wrap gap-2" aria-label="Insight categories">
              <Link
                href="/blog"
                aria-current={!activeCategory ? 'page' : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18372e] ${
                  !activeCategory
                    ? 'bg-emerald-300 text-[#18372e]'
                    : 'border border-white/15 bg-white/[.06] text-emerald-50/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {initialContent.categoryFilterLabel}
              </Link>
              {activeCategories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <Link
                    key={category}
                    href={`/blog?category=${encodeURIComponent(category)}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18372e] ${
                      isActive
                        ? 'bg-emerald-300 text-[#18372e]'
                        : 'border border-white/15 bg-white/[.06] text-emerald-50/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {categoryLabel(category)}
                    <span className="text-xs font-semibold opacity-70">{categoryCountMap.get(category)}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12">
        {posts.length === 0 ? (
          <div className="rounded-[2rem] border border-[#183229]/15 bg-white p-10 text-center sm:p-16">
            <p className="text-5xl" aria-hidden="true">{initialContent.emptyState.emoji}</p>
            <h2 className="mt-6 font-playfair text-4xl font-black">{initialContent.emptyState.title}</h2>
            <p className="mx-auto mt-4 max-w-lg leading-7 text-[#50675e]">{initialContent.emptyState.description}</p>
          </div>
        ) : !featuredPost ? (
          <div className="rounded-[2rem] border border-[#183229]/15 bg-white p-10 text-center sm:p-16">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">No notes in this filter yet</p>
            <h2 className="mt-4 font-playfair text-4xl font-black">Keep the question open.</h2>
            <Link href="/blog" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#126b4e] px-6 py-3 font-bold text-white">
              View all insights <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Latest thinking</p>
                <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">Read what helps you move.</h2>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#50675e] ring-1 ring-[#183229]/10">{noteCountLabel}</span>
            </div>

            <div className="mt-12">
              <BlogPostCard post={featuredPost} featured />
            </div>

            {otherPosts.length > 0 && (
              <section className="mt-16" aria-labelledby="more-notes-heading">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Keep reading</p>
                    <h2 id="more-notes-heading" className="mt-3 font-playfair text-3xl font-black">{initialContent.morePostsTitle}</h2>
                  </div>
                  <span className="text-sm text-[#50675e]">Short, practical notes</span>
                </div>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {otherPosts.map((post) => <BlogPostCard key={post.id} post={post} />)}
                </div>
              </section>
            )}

            <section className="mt-16 rounded-[2rem] border border-[#183229]/10 bg-white p-7 sm:p-10" aria-labelledby="takeaway-heading">
              <div className="grid gap-8 md:grid-cols-[.75fr_1.25fr] md:items-start">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Carry it forward</p>
                  <h2 id="takeaway-heading" className="mt-4 font-playfair text-3xl font-black">A small note can change the next move.</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Name the friction', 'Write down where the work slows or gets repeated.'],
                    ['Choose the result', 'Describe what should be easier when it is done.'],
                    ['Make one decision', 'Start with the smallest useful change you can review.'],
                  ].map(([title, description], index) => (
                    <div key={title} className="rounded-2xl bg-[#f7f4ed] p-4">
                      <span className="text-xs font-bold text-[#126b4e]">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className="mt-4 font-black">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#50675e]">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-16 overflow-hidden rounded-[2rem] bg-[#18372e] p-8 text-white sm:p-12" aria-labelledby="insights-contact-heading">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">When the question is yours</p>
                  <h2 id="insights-contact-heading" className="mt-4 font-playfair text-4xl font-black leading-tight md:text-5xl">Bring the workflow that keeps resisting clarity.</h2>
                  <p className="mt-4 text-lg leading-8 text-emerald-50/75">Share the context and the result you want. We will help define the first useful move.</p>
                </div>
                <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18372e]">
                  Contact <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

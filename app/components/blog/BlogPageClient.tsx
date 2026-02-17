'use client';

import Link from 'next/link';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { EditableSection } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { BlogPageContent } from '@/lib/page-content-types';
import { BlogPostSummary, BLOG_CATEGORIES } from '@/lib/blog-types';
import { focusRingClasses } from '@/lib/colors';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';
import { BookOpen, ArrowRight } from 'lucide-react';

// ============================================================================
// Blog Page Client - Bold Editorial Design
// ============================================================================
// Dark hero with gradient accents, editorial header, styled category pills,
// staggered animations. Matches pricing/homepage aesthetic.

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
          Hero Section - Bold Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Accent glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        {/* Watermark */}
        <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">✎</div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 md:px-12 pt-16 md:pt-20 pb-16 md:pb-20">
          <EditableSection sectionKey="header" label="Page Header">
            <FadeIn direction="up" triggerOnScroll={false}>
              {/* Editorial header */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Blog</span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4">
                  Read. Learn.<br />
                  <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Build.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                  {content.header.description}
                </p>
              </div>
            </FadeIn>
          </EditableSection>

          {/* Category pills - styled like pricing nav */}
          {posts.length > 0 && (
            <StaggerContainer staggerDelay={0.06} className="flex flex-wrap gap-3">
              <StaggerItem>
                <Link
                  href="/blog"
                  className={`
                    group flex items-center gap-2 px-5 py-3 rounded-full
                    border border-white/10 bg-white/5 backdrop-blur-sm
                    transition-all duration-300 hover:-translate-y-0.5
                    hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400
                    ${focusRingClasses.purple}
                  `}
                >
                  <BookOpen size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold text-sm text-white">{content.categoryFilterLabel}</span>
                </Link>
              </StaggerItem>
              {Object.entries(BLOG_CATEGORIES).slice(0, 5).map(([key, label]) => {
                const colorMap: Record<string, string> = {
                  tutorials: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
                  guides: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
                  case_studies: 'hover:border-gold-500/50 hover:bg-gold-500/10 text-gold-400',
                  news: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
                  tips: 'hover:border-slate-400/50 hover:bg-slate-500/10 text-slate-400',
                };
                return (
                  <StaggerItem key={key}>
                    <Link
                      href={`/blog?category=${key}`}
                      className={`
                        group flex items-center gap-2 px-5 py-3 rounded-full
                        border border-white/10 bg-white/5 backdrop-blur-sm
                        transition-all duration-300 hover:-translate-y-0.5
                        ${colorMap[key] || 'hover:border-slate-500/50 hover:bg-slate-500/10 text-slate-400'}
                        ${focusRingClasses.blue}
                      `}
                    >
                      <span className="font-semibold text-sm text-white">{label}</span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ================================================================
          Main Content Section - Clean white with editorial headers
          ================================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {posts.length === 0 ? (
            /* Empty State - Dark card treatment */
            <RevealSection>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-center">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="text-7xl mb-6">{content.emptyState.emoji}</div>
                  <h2 className="text-3xl font-black text-white mb-3">
                    {content.emptyState.title}
                  </h2>
                  <p className="text-slate-400 max-w-md mx-auto text-lg">
                    {content.emptyState.description}
                  </p>
                </div>
              </div>
            </RevealSection>
          ) : (
            <>
              {/* Featured Post - Full width highlight */}
              {featuredPost && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="mb-20">
                    {/* Editorial section header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-500 to-gold-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Featured</span>
                    </div>
                    <BlogPostCard post={featuredPost} featured />
                  </div>
                </FadeIn>
              )}

              {/* Post Grid */}
              {otherPosts.length > 0 && (
                <div>
                  {/* Editorial section header */}
                  <FadeIn direction="up">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">More Articles</span>
                    </div>
                  </FadeIn>

                  <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherPosts.map((post) => (
                      <StaggerItem key={post.id}>
                        <BlogPostCard post={post} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              {/* Bottom CTA - Dark card */}
              <RevealSection>
                <div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 p-10 md:p-14">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div className="max-w-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                        <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Get Started</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                        Ready to build something?
                      </h2>
                      <p className="text-lg text-slate-400">
                        Let&apos;s turn your ideas into reality. Free consultation, no pressure.
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
                    >
                      Get in Touch <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </RevealSection>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

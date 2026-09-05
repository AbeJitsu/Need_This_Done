import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, CalendarDays } from 'lucide-react';
import { BLOG_CATEGORIES, formatPublishedDate, type BlogPostSummary } from '@/lib/blog-types';

const CATEGORY_COLORS: Record<string, {
  badge: string;
  accent: string;
  hoverText: string;
}> = {
  tips: {
    badge: 'bg-[#e4eee6] text-[#126b4e]',
    accent: 'bg-[#126b4e]',
    hoverText: 'group-hover:text-[#126b4e]',
  },
  'case-study': {
    badge: 'bg-[#fbf0d4] text-[#7a5b20]',
    accent: 'bg-[#d9b96e]',
    hoverText: 'group-hover:text-[#7a5b20]',
  },
  tutorial: {
    badge: 'bg-[#eeeaf9] text-[#6d58a5]',
    accent: 'bg-[#6d58a5]',
    hoverText: 'group-hover:text-[#6d58a5]',
  },
  'behind-the-scenes': {
    badge: 'bg-[#e3edf0] text-[#286274]',
    accent: 'bg-[#286274]',
    hoverText: 'group-hover:text-[#286274]',
  },
  news: {
    badge: 'bg-[#e9e5f4] text-[#6d58a5]',
    accent: 'bg-[#6d58a5]',
    hoverText: 'group-hover:text-[#6d58a5]',
  },
};

const DEFAULT_COLORS = CATEGORY_COLORS.tips;

function getCategoryLabel(category: string | null) {
  if (!category) return null;
  return BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES]
    || category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Meta({ post, dark = false }: { post: BlogPostSummary; dark?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${dark ? 'text-emerald-50/60' : 'text-[#50675e]'}`}>
      {post.author_name && <span>{post.author_name}</span>}
      {post.author_name && post.published_at && <span aria-hidden="true">·</span>}
      {post.published_at && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatPublishedDate(post.published_at)}
        </span>
      )}
    </div>
  );
}

interface BlogPostCardProps {
  post: BlogPostSummary;
  featured?: boolean;
}

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const categoryLabel = getCategoryLabel(post.category);
  const colors = CATEGORY_COLORS[post.category || ''] || DEFAULT_COLORS;

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} aria-label={`Read note: ${post.title}`} className="group block focus-visible:outline-none">
        <article className="grid overflow-hidden rounded-[2rem] border border-[#183229]/15 bg-white shadow-xl shadow-emerald-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/15 focus-within:ring-2 focus-within:ring-[#126b4e] focus-within:ring-offset-4 md:grid-cols-[.78fr_1.22fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-[#18372e] p-7 text-white sm:p-10">
            {post.featured_image && (
              <Image src={post.featured_image} alt="" fill unoptimized className="object-cover opacity-40" />
            )}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Latest note</p>
                <div className="mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-300 text-[#18372e]">
                  <BookOpen className="h-7 w-7" aria-hidden="true" />
                </div>
              </div>
              <p className="max-w-xs text-lg font-semibold leading-7 text-emerald-50/80">One clear idea, ready to carry into the work.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10">
            {categoryLabel && <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>{categoryLabel}</span>}
            <h2 className="mt-5 font-playfair text-3xl font-black leading-tight text-[#183229] sm:text-4xl">
              {post.title}
            </h2>
            {post.excerpt && <p className="mt-5 max-w-2xl text-lg leading-8 text-[#50675e]">{post.excerpt}</p>}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <Meta post={post} />
              <span className="inline-flex items-center gap-2 font-bold text-[#126b4e] transition group-hover:gap-3">
                Read note <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} aria-label={`Read note: ${post.title}`} className="group block h-full focus-visible:outline-none">
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#183229]/15 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#126b4e]/40 hover:shadow-xl hover:shadow-emerald-950/10 focus-within:ring-2 focus-within:ring-[#126b4e] focus-within:ring-offset-4">
        <div className={`h-1.5 w-full ${colors.accent}`} aria-hidden="true" />
        {post.featured_image && (
          <div className="relative h-44 overflow-hidden">
            <Image src={post.featured_image} alt={post.title} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          {categoryLabel && <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>{categoryLabel}</span>}
          <h2 className={`mt-5 font-playfair text-2xl font-black leading-tight text-[#183229] transition-colors ${colors.hoverText}`}>{post.title}</h2>
          {post.excerpt && <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#50675e]">{post.excerpt}</p>}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
            <Meta post={post} />
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#126b4e] transition group-hover:gap-3">
              Read note <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

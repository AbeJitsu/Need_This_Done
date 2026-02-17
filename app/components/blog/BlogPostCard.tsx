// ============================================================================
// BlogPostCard Component - Magazine Editorial Style
// ============================================================================
// Two distinct layouts:
// - Featured: Dark editorial card with gradient bg, glow orbs, serif title
// - Standard: White card with category-colored left accent bar
//
// Category colors are declared as full Tailwind class strings so the JIT
// compiler can detect them at build time (no dynamic interpolation).

import Link from 'next/link';
import Image from 'next/image';
import { BlogPostSummary, formatPublishedDate, BLOG_CATEGORIES } from '@/lib/blog-types';
import { ArrowRight } from 'lucide-react';

// ============================================================================
// Category Color Map — full class strings for Tailwind purging
// ============================================================================

const CATEGORY_COLORS: Record<string, {
  badge: string;
  badgeDark: string;
  bar: string;
  hoverText: string;
}> = {
  tutorials: {
    badge: 'bg-emerald-50 text-emerald-600',
    badgeDark: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    bar: 'from-emerald-400 to-emerald-600',
    hoverText: 'group-hover:text-emerald-600',
  },
  guides: {
    badge: 'bg-blue-50 text-blue-600',
    badgeDark: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    bar: 'from-blue-400 to-blue-600',
    hoverText: 'group-hover:text-blue-600',
  },
  case_studies: {
    badge: 'bg-amber-50 text-amber-700',
    badgeDark: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    bar: 'from-amber-400 to-amber-600',
    hoverText: 'group-hover:text-amber-700',
  },
  news: {
    badge: 'bg-purple-50 text-purple-600',
    badgeDark: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    bar: 'from-purple-400 to-purple-600',
    hoverText: 'group-hover:text-purple-600',
  },
  tips: {
    badge: 'bg-gray-100 text-gray-600',
    badgeDark: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    bar: 'from-gray-400 to-gray-600',
    hoverText: 'group-hover:text-gray-600',
  },
};

const DEFAULT_COLORS = CATEGORY_COLORS.news;

interface BlogPostCardProps {
  post: BlogPostSummary;
  featured?: boolean;
}

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const categoryLabel = post.category
    ? BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES] || post.category
    : null;

  const colors = CATEGORY_COLORS[post.category || ''] || DEFAULT_COLORS;

  if (featured) {
    return <FeaturedCard post={post} categoryLabel={categoryLabel} colors={colors} />;
  }

  return <StandardCard post={post} categoryLabel={categoryLabel} colors={colors} />;
}

// ============================================================================
// Featured Card — Dark editorial treatment
// ============================================================================

function FeaturedCard({
  post,
  categoryLabel,
  colors,
}: {
  post: BlogPostSummary;
  categoryLabel: string | null;
  colors: typeof DEFAULT_COLORS;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div
        className="
          relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950
          transition-all duration-500 hover:-translate-y-1
          shadow-xl hover:shadow-2xl hover:shadow-purple-500/20
        "
      >
        {/* Dot texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 md:flex">
          {/* Image — left 2/5 */}
          {post.featured_image && (
            <div className="relative md:w-2/5 h-56 md:h-auto min-h-[280px]">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                unoptimized
                className="object-cover"
              />
              {/* Bleed overlay — image fades into dark bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/80 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80 md:hidden" />
            </div>
          )}

          {/* Content — right 3/5 */}
          <div className={`relative p-8 md:p-10 flex flex-col justify-center ${post.featured_image ? 'md:w-3/5' : 'w-full'}`}>
            {/* Category badge */}
            {categoryLabel && (
              <div className="mb-4">
                <span
                  className={`
                    inline-block px-3 py-1 text-xs font-semibold rounded-full
                    border backdrop-blur-sm ${colors.badgeDark}
                  `}
                >
                  {categoryLabel}
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta + CTA row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                {post.author_name && <span>{post.author_name}</span>}
                {post.author_name && post.published_at && <span>·</span>}
                {post.published_at && <span>{formatPublishedDate(post.published_at)}</span>}
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                Read article <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Standard Card — White with left accent bar
// ============================================================================

function StandardCard({
  post,
  categoryLabel,
  colors,
}: {
  post: BlogPostSummary;
  categoryLabel: string | null;
  colors: typeof DEFAULT_COLORS;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group h-full">
      <div
        className="
          relative overflow-hidden rounded-2xl bg-white
          border border-gray-200 h-full
          transition-all duration-300 hover:-translate-y-1
          hover:shadow-lg hover:border-gray-300
        "
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.bar}`} />

        {/* Image */}
        {post.featured_image && (
          <div className="relative h-44 overflow-hidden">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 pl-6">
          {/* Category badge */}
          {categoryLabel && (
            <div className="mb-3">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${colors.badge}`}>
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className={`font-playfair text-xl font-bold text-gray-900 mb-2 leading-snug transition-colors ${colors.hoverText}`}>
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {post.author_name && <span>{post.author_name}</span>}
            {post.author_name && post.published_at && <span>·</span>}
            {post.published_at && <span>{formatPublishedDate(post.published_at)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

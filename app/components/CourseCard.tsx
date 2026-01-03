import Link from 'next/link';
import Image from 'next/image';
import {
  AccentColor,
  titleColors,
  topBorderColors,
  cardHoverColors,
  formInputColors,
  mutedTextColors,
  accentColors,
  shadowClasses,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';
import { formatPriceWhole } from '@/lib/format';

// ============================================================================
// CourseCard Component
// ============================================================================
// What: Displays a course preview/listing card for LMS
// Why: Enables course discovery and enrollment across the platform
// How: Shows thumbnail, title, instructor, duration, lessons, and price/progress
//
// Variants:
// - "preview": Course listing view (default) - shows price if not enrolled
// - "enrolled": Student's course - shows progress bar instead of price

export interface CourseCardProps {
  // Course details
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl?: string;

  // Course metadata
  duration: string;        // e.g., "2.5 hours", "12 hours"
  lessonCount: number;

  // Pricing (for preview variant)
  price?: number;          // Price in cents (0 = free)
  originalPrice?: number;  // Original price if discounted

  // Progress (for enrolled variant)
  progress?: number;       // 0-100 percentage

  // Styling
  color?: AccentColor;

  // Navigation
  href: string;

  // Variant
  variant?: 'preview' | 'enrolled';
}

export default function CourseCard({
  title,
  description,
  instructor,
  thumbnailUrl,
  duration,
  lessonCount,
  price,
  originalPrice,
  progress,
  color = 'blue',
  href,
  variant = 'preview',
}: CourseCardProps) {
  const isEnrolled = variant === 'enrolled';
  const isFree = price === 0;
  const hasDiscount = originalPrice && originalPrice > (price || 0);


  return (
    <Link
      href={href}
      className={`
        block ${cardBgColors.base} rounded-xl
        ${cardBorderColors.light} border-t-4
        ${topBorderColors[color]}
        transition-all duration-300
        ${cardHoverColors[color]}
        ${shadowClasses.cardHover}
        overflow-hidden
      `}
    >
      {/* Course Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${title} course thumbnail`}
            fill
            className="object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${accentColors[color].bg}`}>
            <svg
              className={`w-12 h-12 ${accentColors[color].text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Title */}
        <h3 className={`font-bold text-lg mb-1 ${titleColors[color]} line-clamp-2`}>
          {title}
        </h3>

        {/* Instructor */}
        <p className={`text-sm ${mutedTextColors.light} mb-2`}>
          by {instructor}
        </p>

        {/* Description (truncated) */}
        <p className={`${formInputColors.helper} text-sm mb-3 line-clamp-2`}>
          {description}
        </p>

        {/* Metadata row */}
        <div className={`flex items-center gap-3 text-xs ${mutedTextColors.light} mb-3`}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </span>
        </div>

        {/* Progress bar (enrolled) or Price (preview) */}
        {isEnrolled && progress !== undefined ? (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={mutedTextColors.light}>Progress</span>
              <span className={titleColors[color]}>{progress}%</span>
            </div>
            <div
              className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full ${accentColors[color].bg} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            {isFree ? (
              <span className={`font-bold text-lg ${titleColors[color]}`}>Free</span>
            ) : price !== undefined ? (
              <>
                <span className={`font-bold text-lg ${titleColors[color]}`}>
                  {formatPriceWhole(price)}
                </span>
                {hasDiscount && originalPrice && (
                  <span className={`text-sm line-through ${mutedTextColors.light}`}>
                    {formatPriceWhole(originalPrice)}
                  </span>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}

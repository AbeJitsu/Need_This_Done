'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPuckFullColors, PuckEmptyState } from '@/lib/puck-utils';

// ============================================================================
// Testimonials Component - Social Proof Display
// ============================================================================
// What: Interactive testimonial carousel/grid with customer reviews
// Why: Social proof drives conversions - 92% of customers read reviews before buying
// How: Client component with useState for carousel navigation, auto-play support
// DRY: Uses getPuckFullColors() from puck-utils for consistent color handling

interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsComponentProps {
  testimonials: Testimonial[];
  layout: 'carousel' | 'grid' | 'single';
  showRating: 'yes' | 'no';
  showAvatar: 'yes' | 'no';
  autoPlay: 'yes' | 'no';
  accentColor: string;
}

// ============================================================================
// Star Rating Component
// ============================================================================

function StarRating({ rating, starColor }: { rating: number; starColor: string }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? starColor : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ============================================================================
// Single Testimonial Card
// ============================================================================

function TestimonialCard({
  testimonial,
  showRating,
  showAvatar,
  colors,
}: {
  testimonial: Testimonial;
  showRating: boolean;
  showAvatar: boolean;
  colors: ReturnType<typeof getPuckFullColors>;
}) {
  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 border ${colors.cardBorderHover} transition-all duration-300 h-full flex flex-col`}
    >
      {/* Quote mark */}
      <svg
        className={`absolute top-4 right-4 w-8 h-8 ${colors.quoteColor}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      {/* Rating */}
      {showRating && testimonial.rating && (
        <StarRating rating={testimonial.rating} starColor={colors.starColor} />
      )}

      {/* Quote */}
      <blockquote className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 flex-grow">
        &ldquo;{testimonial.quote || 'Great experience!'}&rdquo;
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        {showAvatar && (
          <div className="flex-shrink-0">
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.author || 'Customer'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                {(testimonial.author || 'A').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {testimonial.author || 'Happy Customer'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {testimonial.role}
            {testimonial.role && testimonial.company && ' at '}
            {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TestimonialsComponent({
  testimonials,
  layout,
  showRating,
  showAvatar,
  autoPlay,
  accentColor,
}: TestimonialsComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const showRatingBool = showRating === 'yes';
  const showAvatarBool = showAvatar === 'yes';
  const autoPlayBool = autoPlay === 'yes';

  // Get colors from centralized utility
  const colors = getPuckFullColors(accentColor);

  // Auto-play carousel
  const nextSlide = useCallback(() => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  }, [testimonials.length]);

  useEffect(() => {
    if (layout === 'carousel' && autoPlayBool && testimonials.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [layout, autoPlayBool, testimonials.length, nextSlide]);

  // Empty state - use shared component
  if (!testimonials || testimonials.length === 0) {
    return (
      <PuckEmptyState
        message="Add testimonials to display"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        }
      />
    );
  }

  // Single testimonial (featured)
  if (layout === 'single') {
    return (
      <div className="max-w-2xl mx-auto">
        <TestimonialCard
          testimonial={testimonials[0]}
          showRating={showRatingBool}
          showAvatar={showAvatarBool}
          colors={colors}
        />
      </div>
    );
  }

  // Grid layout
  if (layout === 'grid') {
    const gridCols =
      testimonials.length === 1
        ? 'grid-cols-1'
        : testimonials.length === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
      <div className={`grid ${gridCols} gap-6`}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            testimonial={testimonial}
            showRating={showRatingBool}
            showAvatar={showAvatarBool}
            colors={colors}
          />
        ))}
      </div>
    );
  }

  // Carousel layout - use colors.dotActive from centralized utility
  return (
    <div className="relative">
      {/* Main testimonial */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-2">
              <div className="max-w-2xl mx-auto">
                <TestimonialCard
                  testimonial={testimonial}
                  showRating={showRatingBool}
                  showAvatar={showAvatarBool}
                  colors={colors}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? `${colors.dotActive} w-8`
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow navigation */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================================================
// Stats Counter Component - Animated Metrics Display
// ============================================================================
// What: Animated counters that count up when scrolled into view
// Why: Numbers with animation capture attention and build credibility
// How: Intersection Observer triggers count-up animation on visibility

interface Stat {
  value?: number;
  suffix?: string;
  prefix?: string;
  label?: string;
  icon?: 'users' | 'chart' | 'star' | 'check' | 'clock' | 'trophy' | 'heart' | 'globe';
}

interface StatsCounterComponentProps {
  stats: Stat[];
  layout: '2-col' | '3-col' | '4-col' | 'horizontal';
  style: 'cards' | 'minimal' | 'bordered';
  animationDuration: number;
  accentColor: string;
}

// ============================================================================
// Icon Components
// ============================================================================

const icons: Record<string, React.ReactNode> = {
  users: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  star: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  check: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trophy: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  heart: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  globe: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================================================
// Animated Counter Hook
// ============================================================================

function useCountUp(end: number, duration: number, shouldAnimate: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldAnimate]);

  return count;
}

// ============================================================================
// Single Stat Card
// ============================================================================

function StatCard({
  stat,
  style,
  accentColor,
  isVisible,
  animationDuration,
}: {
  stat: Stat;
  style: string;
  accentColor: string;
  isVisible: boolean;
  animationDuration: number;
}) {
  const count = useCountUp(stat.value || 0, animationDuration, isVisible);

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      text: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
    },
  };

  const colors = colorMap[accentColor] || colorMap.purple;

  // Format number with commas
  const formattedCount = count.toLocaleString();

  // Style variations
  const styleClasses: Record<string, string> = {
    cards: `${colors.bg} rounded-xl p-6`,
    minimal: 'py-4',
    bordered: 'border border-gray-200 dark:border-gray-700 rounded-xl p-6',
  };

  return (
    <div className={`text-center ${styleClasses[style] || styleClasses.cards}`}>
      {/* Icon */}
      {stat.icon && (
        <div className={`inline-flex items-center justify-center w-14 h-14 ${colors.iconBg} ${colors.text} rounded-xl mb-4`}>
          {icons[stat.icon] || icons.star}
        </div>
      )}

      {/* Value */}
      <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {stat.prefix || ''}
        {formattedCount}
        {stat.suffix || ''}
      </div>

      {/* Label */}
      {stat.label && (
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {stat.label}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function StatsCounterComponent({
  stats,
  layout,
  style,
  animationDuration,
  accentColor,
}: StatsCounterComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Empty state
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
        <svg
          className="w-12 h-12 mx-auto text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">Add statistics to display</p>
      </div>
    );
  }

  // Layout classes
  const layoutClasses: Record<string, string> = {
    '2-col': 'grid grid-cols-1 sm:grid-cols-2 gap-6',
    '3-col': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
    '4-col': 'grid grid-cols-2 lg:grid-cols-4 gap-6',
    horizontal: 'flex flex-wrap justify-center gap-8 md:gap-12',
  };

  return (
    <div ref={containerRef} className={layoutClasses[layout] || layoutClasses['3-col']}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          stat={stat}
          style={style}
          accentColor={accentColor}
          isVisible={isVisible}
          animationDuration={animationDuration}
        />
      ))}
    </div>
  );
}

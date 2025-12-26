'use client';

import { useState, useEffect, useRef } from 'react';
import { getPuckFullColors, puckIcons, PuckEmptyState } from '@/lib/puck-utils';

// ============================================================================
// Stats Counter Component - Animated Metrics Display
// ============================================================================
// What: Animated counters that count up when scrolled into view
// Why: Numbers with animation capture attention and build credibility
// How: Intersection Observer triggers count-up animation on visibility
// DRY: Uses puckIcons and getPuckFullColors() from puck-utils

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
  colors,
  isVisible,
  animationDuration,
}: {
  stat: Stat;
  style: string;
  colors: ReturnType<typeof getPuckFullColors>;
  isVisible: boolean;
  animationDuration: number;
}) {
  const count = useCountUp(stat.value || 0, animationDuration, isVisible);

  // Format number with commas
  const formattedCount = count.toLocaleString();

  // Style variations - use centralized colors
  const styleClasses: Record<string, string> = {
    cards: `${colors.subtleBg} rounded-xl p-6`,
    minimal: 'py-4',
    bordered: 'border border-gray-200 dark:border-gray-700 rounded-xl p-6',
  };

  return (
    <div className={`text-center ${styleClasses[style] || styleClasses.cards}`}>
      {/* Icon - uses puckIcons from centralized utility */}
      {stat.icon && (
        <div className={`inline-flex items-center justify-center w-14 h-14 ${colors.iconBg} ${colors.accentText} rounded-xl mb-4`}>
          <div className="w-8 h-8">{puckIcons[stat.icon] || puckIcons.star}</div>
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

  // Get colors from centralized utility
  const colors = getPuckFullColors(accentColor);

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

  // Empty state - use shared component
  if (!stats || stats.length === 0) {
    return (
      <PuckEmptyState
        message="Add statistics to display"
        icon={puckIcons.chart}
      />
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
          colors={colors}
          isVisible={isVisible}
          animationDuration={animationDuration}
        />
      ))}
    </div>
  );
}

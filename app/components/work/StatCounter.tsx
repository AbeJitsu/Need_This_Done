'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================================
// Stat Counter - Animated number with label
// ============================================================================
// Uses intersection observer to trigger count-up animation when visible.

const colorMap = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  amber: 'text-amber-400',
};

interface StatCounterProps {
  value: string;
  label: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

export default function StatCounter({ value, label, color }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          // Extract numeric part and suffix (e.g., "160+" → 160, "+")
          const numericMatch = value.match(/^(\d+)(.*)/);
          if (!numericMatch) {
            setDisplayValue(value);
            return;
          }
          const target = parseInt(numericMatch[1], 10);
          const suffix = numericMatch[2] || '';
          const duration = 1200;
          const steps = 30;
          const stepTime = duration / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += Math.ceil(target / steps);
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setDisplayValue(`${current}${suffix}`);
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className={`font-playfair text-4xl md:text-5xl font-black tracking-tight ${colorMap[color]}`}>
        {displayValue}
      </div>
      <div className="text-sm text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

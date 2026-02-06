'use client';

// ============================================================================
// Tech Stack Badge - Small pill showing a technology name
// ============================================================================

interface TechStackBadgeProps {
  name: string;
  variant?: 'dark' | 'light';
}

export default function TechStackBadge({ name, variant = 'dark' }: TechStackBadgeProps) {
  const classes =
    variant === 'dark'
      ? 'bg-white/10 text-slate-200 border-white/10'
      : 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full border ${classes}`}>
      {name}
    </span>
  );
}

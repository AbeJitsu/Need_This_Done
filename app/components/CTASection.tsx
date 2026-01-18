// ============================================================================
// CTASection Component - Premium Call-to-Action Sections
// ============================================================================
// Clean, editorial design with subtle gradient and geometric accents.
// No muddy blurs - just refined visual hierarchy and elegant simplicity.

'use client';

import Button from './Button';
import { AccentVariant, headingColors, formInputColors } from '@/lib/colors';
import { accentText } from '@/lib/contrast';

interface CTAButton {
  text: string;
  variant: AccentVariant;
  href: string;
  size?: 'sm' | 'md' | 'lg';
}

interface CTASectionProps {
  title: string;
  description?: string;
  buttons: CTAButton[];
  hoverColor?: AccentVariant;
}

// ============================================================================
// Color themes - clean, vibrant accents
// ============================================================================

const themeColors: Record<AccentVariant, {
  accentBg: string;
  accentBorder: string;
  textColor: string;
  cornerAccent: string;
  dotColor: string;
}> = {
  gold: {
    accentBg: 'bg-gold-500',
    accentBorder: 'border-gold-200',
    textColor: accentText.gold,
    cornerAccent: 'bg-gold-100',
    dotColor: 'bg-gold-400',
  },
  blue: {
    accentBg: 'bg-blue-500',
    accentBorder: 'border-blue-200',
    textColor: accentText.blue,
    cornerAccent: 'bg-blue-100',
    dotColor: 'bg-blue-400',
  },
  purple: {
    accentBg: 'bg-purple-500',
    accentBorder: 'border-purple-200',
    textColor: accentText.purple,
    cornerAccent: 'bg-purple-100',
    dotColor: 'bg-purple-400',
  },
  green: {
    accentBg: 'bg-green-500',
    accentBorder: 'border-green-200',
    textColor: accentText.emerald,
    cornerAccent: 'bg-green-100',
    dotColor: 'bg-green-400',
  },
  teal: {
    accentBg: 'bg-emerald-500',
    accentBorder: 'border-emerald-200',
    textColor: accentText.teal,
    cornerAccent: 'bg-emerald-100',
    dotColor: 'bg-emerald-400',
  },
  gray: {
    accentBg: 'bg-slate-500',
    accentBorder: 'border-slate-200',
    textColor: accentText.gray,
    cornerAccent: 'bg-slate-100',
    dotColor: 'bg-slate-400',
  },
  red: {
    accentBg: 'bg-red-500',
    accentBorder: 'border-red-200',
    textColor: accentText.red,
    cornerAccent: 'bg-red-100',
    dotColor: 'bg-red-400',
  },
};

export default function CTASection({
  title,
  description,
  buttons,
  hoverColor = 'gold'
}: CTASectionProps) {
  const theme = themeColors[hoverColor];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Top accent bar - bold color stripe */}
      <div className={`h-1.5 ${theme.accentBg}`} />

      {/* Corner geometric accents */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.cornerAccent} dark:bg-gray-800 rounded-bl-[100px] opacity-50`} />
      <div className={`absolute bottom-0 left-0 w-24 h-24 ${theme.cornerAccent} dark:bg-gray-800 rounded-tr-[80px] opacity-30`} />

      {/* Content */}
      <div className="relative px-8 py-12 md:px-12 md:py-14 text-center">
        {/* Small decorative element */}
        <div className="flex justify-center gap-1 mb-5">
          <div className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
          <div className={`w-2 h-2 rounded-full ${theme.dotColor} opacity-60`} />
          <div className={`w-2 h-2 rounded-full ${theme.dotColor} opacity-30`} />
        </div>

        {/* Title */}
        <h2 className={`
          text-2xl md:text-3xl font-bold
          ${headingColors.primary}
          mb-3
        `}>
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className={`
            ${formInputColors.helper}
            text-base md:text-lg
            mb-8 max-w-lg mx-auto
          `}>
            {description}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          {buttons.map((button, i) => (
            <Button
              key={i}
              variant={button.variant}
              href={button.href}
              size={button.size || 'lg'}
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

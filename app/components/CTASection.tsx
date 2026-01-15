// ============================================================================
// CTASection Component - Reusable Call-to-Action Sections
// ============================================================================
// Composes Card and Button for consistent CTA styling across all pages.
// Replaces repeated CTA patterns on Services, Pricing, How It Works, FAQ.

import Card from './Card';
import Button from './Button';
import { AccentVariant, headingColors, formInputColors } from '@/lib/colors';

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

export default function CTASection({
  title,
  description,
  buttons,
  hoverColor = 'gold'
}: CTASectionProps) {
  return (
    <Card hoverColor={hoverColor} className="text-center">
      <h2 className={`text-2xl font-bold ${headingColors.primary} mb-4`}>
        {title}
      </h2>
      {description && (
        <p className={`${formInputColors.helper} mb-6`}>
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        {buttons.map((button, i) => (
          <Button
            key={i}
            variant={button.variant}
            href={button.href}
            size={button.size || 'md'}
          >
            {button.text}
          </Button>
        ))}
      </div>
    </Card>
  );
}

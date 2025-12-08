import Link from 'next/link';
import { faqColors } from '@/lib/colors';
import CircleBadge from '@/components/CircleBadge';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import type { FAQPageContent } from '@/lib/page-content-types';

// ============================================================================
// FAQ Preview Component
// ============================================================================
// What: Renders the FAQ page with provided content (not fetched)
// Why: Used in the content editor to show live preview of changes
// How: Same structure as the actual FAQ page, but takes content as props

interface FAQPreviewProps {
  content: FAQPageContent;
}

// Helper: Render Answer with Links
function renderAnswer(answer: string, links?: Array<{ text: string; href: string }>) {
  if (!links || links.length === 0) {
    return answer;
  }

  let result = answer;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  links.forEach((link, idx) => {
    const linkIndex = result.indexOf(link.text, lastIndex);
    if (linkIndex !== -1) {
      if (linkIndex > lastIndex) {
        parts.push(result.slice(lastIndex, linkIndex));
      }
      parts.push(
        <Link
          key={idx}
          href={link.href}
          className="text-blue-700 dark:text-blue-400 font-medium hover:underline"
        >
          {link.text}
        </Link>
      );
      lastIndex = linkIndex + link.text.length;
    }
  });

  if (lastIndex < result.length) {
    parts.push(result.slice(lastIndex));
  }

  return parts.length > 0 ? parts : answer;
}

export default function FAQPreview({ content }: FAQPreviewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={content.header.title}
        description={content.header.description}
      />

      {/* FAQ List */}
      <div className="space-y-6 mb-10">
        {content.items.map((faq, index) => {
          const colors = ['green', 'blue', 'purple', 'orange'] as const;
          const color = colors[index % 4];
          const styles = faqColors[color];
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 border-l-4 ${styles.border} ${styles.hover} transition-all hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`}
            >
              <div className="flex items-start gap-4">
                <CircleBadge number={index + 1} color={color} size="sm" />
                <div>
                  <h2 className={`text-lg font-semibold mb-2 ${styles.text}`}>
                    {faq.question}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {renderAnswer(faq.answer, faq.links)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <CTASection
        title={content.cta.title}
        description={content.cta.description}
        buttons={content.cta.buttons}
        hoverColor={content.cta.hoverColor || 'orange'}
      />
    </div>
  );
}

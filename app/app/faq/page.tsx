import Link from 'next/link';
import { faqColors } from '@/lib/colors';
import CircleBadge from '@/components/CircleBadge';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { getDefaultFAQContent } from '@/lib/default-page-content';
import type { FAQPageContent } from '@/lib/page-content-types';

// ============================================================================
// FAQ Page - Common Questions
// ============================================================================
// Answers common questions clients might have about the service.
// Content is fetched from the database (if customized) or uses defaults.

export const metadata = {
  title: 'FAQ - NeedThisDone',
  description: 'Frequently asked questions about our services.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<FAQPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/faq`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as FAQPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch FAQ content:', error);
  }

  return getDefaultFAQContent();
}

// ============================================================================
// Helper: Render Answer with Links
// ============================================================================

function renderAnswer(answer: string, links?: Array<{ text: string; href: string }>) {
  if (!links || links.length === 0) {
    return answer;
  }

  // Replace link text with actual links
  let result = answer;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  links.forEach((link, idx) => {
    const linkIndex = result.indexOf(link.text, lastIndex);
    if (linkIndex !== -1) {
      // Add text before the link
      if (linkIndex > lastIndex) {
        parts.push(result.slice(lastIndex, linkIndex));
      }
      // Add the link
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

  // Add remaining text
  if (lastIndex < result.length) {
    parts.push(result.slice(lastIndex));
  }

  return parts.length > 0 ? parts : answer;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function FAQPage() {
  const content = await getContent();

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
            // Cycle through colors: green, blue, purple, orange
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

        {/* Contact Section */}
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'orange'}
        />
    </div>
  );
}

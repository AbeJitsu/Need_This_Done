'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { EditableSection } from '@/components/InlineEditor';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { TermsPageContent } from '@/lib/page-content-types';
import {
  headingColors,
  formInputColors,
  cardBgColors,
  cardBorderColors,
  linkColors,
  linkHoverColors,
  alertColors,
} from '@/lib/colors';

// ============================================================================
// Terms Page Client - Inline Editable Version
// ============================================================================

interface TermsPageClientProps {
  initialContent: TermsPageContent;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={`text-2xl font-semibold mb-4 ${headingColors.primary}`}>
        {title}
      </h2>
      <div className={`space-y-4 ${formInputColors.helper}`}>
        {children}
      </div>
    </section>
  );
}

export default function TermsPageClient({ initialContent }: TermsPageClientProps) {
  const { content } = useEditableContent<TermsPageContent>(initialContent);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      <p className={`text-center mb-10 ${formInputColors.helper}`}>
        Last updated: {content.lastUpdated}
      </p>

      {/* Quick Summary Box */}
      <div className={`${alertColors.info.bg} ${alertColors.info.border} rounded-xl p-6 mb-10`}>
        <h2 className={`text-lg font-semibold mb-3 ${alertColors.info.text}`}>
          The Short Version
        </h2>
        <ul className={`space-y-2 ${alertColors.info.text} list-disc list-inside`}>
          <li>Be respectful and use our services lawfully</li>
          <li>Pay for services you book</li>
          <li>We&apos;ll do our best to help you get things done</li>
          <li>Either party can end the relationship anytime</li>
        </ul>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>
          By using NeedThisDone.com, you agree to these terms. If you don&apos;t agree, please don&apos;t use our services.
        </p>
        <p>
          These terms apply to all visitors, users, and customers of our website and services.
        </p>
      </Section>

      <Section title="2. Our Services">
        <p>
          NeedThisDone provides personal assistance and errand services. We help you tackle your to-do list through scheduled consultations and task completion.
        </p>
        <p>
          Service availability may vary. We reserve the right to modify, suspend, or discontinue services at any time with reasonable notice.
        </p>
      </Section>

      <Section title="3. Payments & Refunds">
        <p>All payments are processed securely through Stripe.</p>
        <div className={`${cardBgColors.base} ${cardBorderColors.light} rounded-lg p-4 mt-4`}>
          <h3 className={`font-medium mb-3 ${headingColors.primary}`}>Refund Policy</h3>
          <ul className="space-y-2">
            <li>• <strong>Consultation fees:</strong> Non-refundable once the consultation is completed</li>
            <li>• <strong>Cancellations 24+ hours in advance:</strong> Full refund</li>
            <li>• <strong>Cancellations less than 24 hours:</strong> 50% refund</li>
            <li>• <strong>No-shows:</strong> No refund</li>
          </ul>
        </div>
        <p className="mt-4">
          If you have concerns about a charge, please{' '}
          <Link href="/contact" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            contact us
          </Link>{' '}
          within 7 days.
        </p>
      </Section>

      <Section title="4. User Responsibilities">
        <p>When using our services, you agree to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Provide accurate information when booking</li>
          <li>Treat our team with respect and courtesy</li>
          <li>Not use our services for illegal activities</li>
          <li>Show up on time for scheduled appointments</li>
          <li>Pay for services rendered</li>
          <li>Keep your account credentials secure</li>
        </ul>
      </Section>

      <Section title="5. Limitation of Liability">
        <p>
          NeedThisDone provides services &quot;as is.&quot; We do our best to help, but we can&apos;t guarantee specific outcomes.
        </p>
        <p className="mt-4">
          Our total liability is limited to the amount you paid for the specific service in question.
        </p>
      </Section>

      <Section title="6. Privacy">
        <p>
          Your privacy matters to us. Please review our{' '}
          <Link href="/privacy" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            Privacy Policy
          </Link>{' '}
          to understand how we collect, use, and protect your information.
        </p>
      </Section>

      <Section title="7. Contact Us">
        <p>Questions about these terms?</p>
        <p className="mt-4">
          <strong>Email:</strong>{' '}
          <Link href="mailto:hello@needthisdone.com" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            hello@needthisdone.com
          </Link>
        </p>
        <p className="mt-2">
          <strong>Website:</strong>{' '}
          <Link href="/contact" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            needthisdone.com/contact
          </Link>
        </p>
      </Section>
    </div>
  );
}

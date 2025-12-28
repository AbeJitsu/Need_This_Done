import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
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
// Terms of Service Page
// ============================================================================
// Required for Google Cloud Console production verification.
// Uses the site's color system for consistent styling and dark mode support.

export const metadata = {
  title: 'Terms of Service - NeedThisDone',
  description: 'The agreement between you and NeedThisDone when using our services.',
};

// ============================================================================
// Section Component - Reusable styled section
// ============================================================================

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

// ============================================================================
// Page Component
// ============================================================================

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

      {/* Header */}
      <PageHeader
        title="Terms of Service"
        description="The agreement between you and us"
      />

      {/* Last Updated */}
      <p className={`text-center mb-10 ${formInputColors.helper}`}>
        Last updated: December 2025
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

      {/* Section 1: Acceptance of Terms */}
      <Section title="1. Acceptance of Terms">
        <p>
          By using NeedThisDone.com, you agree to these terms. If you don&apos;t agree, please don&apos;t use our services.
        </p>
        <p>
          These terms apply to all visitors, users, and customers of our website and services.
        </p>
      </Section>

      {/* Section 2: Our Services */}
      <Section title="2. Our Services">
        <p>
          NeedThisDone provides personal assistance and errand services. We help you tackle your to-do list through scheduled consultations and task completion.
        </p>
        <p>
          Service availability may vary. We reserve the right to modify, suspend, or discontinue services at any time with reasonable notice.
        </p>
      </Section>

      {/* Section 3: Payments & Refunds */}
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

      {/* Section 4: User Responsibilities */}
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
        <p className="mt-4">
          We reserve the right to refuse service to anyone who violates these responsibilities.
        </p>
      </Section>

      {/* Section 5: Limitation of Liability */}
      <Section title="5. Limitation of Liability">
        <p>
          NeedThisDone provides services &quot;as is.&quot; We do our best to help, but we can&apos;t guarantee specific outcomes.
        </p>
        <p className="mt-2">We are not liable for:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Indirect or consequential damages</li>
          <li>Loss of data or business interruption</li>
          <li>Third-party actions or services</li>
          <li>Events outside our reasonable control</li>
        </ul>
        <p className="mt-4">
          Our total liability is limited to the amount you paid for the specific service in question.
        </p>
      </Section>

      {/* Section 6: Intellectual Property */}
      <Section title="6. Intellectual Property">
        <p>
          All content on NeedThisDone.com (logos, text, images, design) belongs to us or our licensors.
        </p>
        <p className="mt-2">
          You may not copy, modify, distribute, or create derivative works from our content without written permission.
        </p>
        <p className="mt-2">
          You retain ownership of any content you submit to us (like appointment notes or messages).
        </p>
      </Section>

      {/* Section 7: Privacy */}
      <Section title="7. Privacy">
        <p>
          Your privacy matters to us. Please review our{' '}
          <Link href="/privacy" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            Privacy Policy
          </Link>{' '}
          to understand how we collect, use, and protect your information.
        </p>
        <p className="mt-2">
          By using our services, you consent to our data practices as described in the Privacy Policy.
        </p>
      </Section>

      {/* Section 8: Termination */}
      <Section title="8. Termination">
        <p>You can stop using our services anytime by:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Canceling any active appointments</li>
          <li>Deleting your account (email us at hello@needthisdone.com)</li>
          <li>Simply not using the service anymore</li>
        </ul>

        <p className="mt-4">We may suspend or terminate your access if you:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Violate these terms</li>
          <li>Engage in fraudulent activity</li>
          <li>Abuse our team or other customers</li>
          <li>Use our services for illegal purposes</li>
        </ul>
      </Section>

      {/* Section 9: Changes to Terms */}
      <Section title="9. Changes to Terms">
        <p>
          We may update these terms from time to time. When we do, we&apos;ll update the &quot;Last updated&quot; date at the top.
        </p>
        <p className="mt-2">
          For significant changes, we&apos;ll notify you by email or through a notice on our website.
        </p>
        <p className="mt-2">
          Continued use after changes means you accept the new terms.
        </p>
      </Section>

      {/* Section 10: Dispute Resolution */}
      <Section title="10. Dispute Resolution">
        <p>
          If you have a dispute with us, please contact us first at{' '}
          <Link href="mailto:hello@needthisdone.com" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            hello@needthisdone.com
          </Link>
          . We&apos;ll try to resolve it informally.
        </p>
        <p className="mt-2">
          If we can&apos;t resolve it informally, any legal proceedings will be conducted in the courts of California, United States.
        </p>
      </Section>

      {/* Section 11: Governing Law */}
      <Section title="11. Governing Law">
        <p>
          These terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.
        </p>
      </Section>

      {/* Section 12: Contact Us */}
      <Section title="12. Contact Us">
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

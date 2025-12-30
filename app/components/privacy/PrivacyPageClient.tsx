'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { EditableSection } from '@/components/InlineEditor';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { PrivacyPageContent } from '@/lib/page-content-types';
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
// Privacy Page Client - Inline Editable Version
// ============================================================================

interface PrivacyPageClientProps {
  initialContent: PrivacyPageContent;
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className={`text-lg font-medium mb-2 ${headingColors.secondary}`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function PrivacyPageClient({ initialContent }: PrivacyPageClientProps) {
  const { content } = useEditableContent<PrivacyPageContent>(initialContent);

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
          Quick Summary
        </h2>
        <ul className={`space-y-2 ${alertColors.info.text} list-disc list-inside`}>
          <li>We only collect what we need to serve you</li>
          <li>We never sell your personal information</li>
          <li>You can request deletion of your data anytime</li>
          <li>We use industry-standard security measures</li>
        </ul>
      </div>

      <Section title="1. Information We Collect">
        <p>When you use NeedThisDone, we collect:</p>
        <Subsection title="Account Information">
          <p>Name, email address, and password when you create an account or sign in with Google.</p>
        </Subsection>
        <Subsection title="Payment Information">
          <p>Processed securely through Stripe. We never store your full card number on our servers.</p>
        </Subsection>
        <Subsection title="Appointment Details">
          <p>Date, time, and notes you provide when booking services.</p>
        </Subsection>
        <Subsection title="Usage Information">
          <p>Pages you visit, features you use, and how you interact with our site (to help us improve).</p>
        </Subsection>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Provide our services and process your requests</li>
          <li>Process payments and send receipts</li>
          <li>Schedule and manage your appointments</li>
          <li>Send confirmations and reminders</li>
          <li>Respond to your questions and support requests</li>
          <li>Improve our website and services</li>
          <li>Send updates about our services (with your consent)</li>
        </ul>
        <p className="mt-4 font-medium">
          We will never sell your personal information to third parties. Ever.
        </p>
      </Section>

      <Section title="3. Third-Party Services">
        <p className="mb-4">We work with trusted partners to provide our services:</p>
        <div className={`${cardBgColors.base} ${cardBorderColors.light} rounded-lg overflow-hidden`}>
          <table className="w-full">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className={`px-4 py-3 font-medium ${headingColors.primary}`}>Stripe</td>
                <td className={`px-4 py-3 ${formInputColors.helper}`}>
                  Secure payment processing
                  <br />
                  <Link href="https://stripe.com/privacy" className={`text-sm ${linkColors.blue} ${linkHoverColors.blue}`} target="_blank" rel="noopener noreferrer">
                    stripe.com/privacy
                  </Link>
                </td>
              </tr>
              <tr>
                <td className={`px-4 py-3 font-medium ${headingColors.primary}`}>Google</td>
                <td className={`px-4 py-3 ${formInputColors.helper}`}>
                  Sign-in and calendar integration
                  <br />
                  <Link href="https://policies.google.com/privacy" className={`text-sm ${linkColors.blue} ${linkHoverColors.blue}`} target="_blank" rel="noopener noreferrer">
                    policies.google.com/privacy
                  </Link>
                </td>
              </tr>
              <tr>
                <td className={`px-4 py-3 font-medium ${headingColors.primary}`}>Supabase</td>
                <td className={`px-4 py-3 ${formInputColors.helper}`}>
                  Secure database and authentication
                  <br />
                  <Link href="https://supabase.com/privacy" className={`text-sm ${linkColors.blue} ${linkHoverColors.blue}`} target="_blank" rel="noopener noreferrer">
                    supabase.com/privacy
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. Your Rights">
        <p>You have the right to:</p>
        <Subsection title="Access Your Data">
          <p>Request a copy of the personal information we have about you.</p>
        </Subsection>
        <Subsection title="Correct Your Data">
          <p>Update or fix any inaccurate information.</p>
        </Subsection>
        <Subsection title="Delete Your Data">
          <p>Request that we delete your personal information.</p>
        </Subsection>
        <p className="mt-4">
          To exercise these rights, email us at{' '}
          <Link href="mailto:hello@needthisdone.com" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            hello@needthisdone.com
          </Link>
        </p>
      </Section>

      <Section title="5. Contact Us">
        <p>Questions or concerns about your privacy?</p>
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

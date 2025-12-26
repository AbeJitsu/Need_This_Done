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
// Privacy Policy Page
// ============================================================================
// Required for Google Cloud Console production verification.
// Uses the site's color system for consistent styling and dark mode support.

export const metadata = {
  title: 'Privacy Policy - NeedThisDone',
  description: 'How we collect, use, and protect your personal information.',
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
// Subsection Component - For nested content
// ============================================================================

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

// ============================================================================
// Page Component
// ============================================================================

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

      {/* Header */}
      <PageHeader
        title="Privacy Policy"
        description="How we collect, use, and protect your data"
      />

      {/* Last Updated */}
      <p className={`text-center mb-10 ${formInputColors.helper}`}>
        Last updated: December 2025
      </p>

      {/* Quick Summary Box */}
      <div className={`${alertColors.info.bg} ${alertColors.info.border} rounded-xl p-6 mb-10`}>
        <h2 className={`text-lg font-semibold mb-3 ${alertColors.info.text}`}>
          Quick Summary
        </h2>
        <ul className={`space-y-2 ${alertColors.info.text}`}>
          <li>• We only collect what we need to serve you</li>
          <li>• We never sell your personal information</li>
          <li>• You can request deletion of your data anytime</li>
          <li>• We use industry-standard security measures</li>
        </ul>
      </div>

      {/* Section 1: Information We Collect */}
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

      {/* Section 2: How We Use Your Information */}
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

      {/* Section 3: Third-Party Services */}
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
              <tr>
                <td className={`px-4 py-3 font-medium ${headingColors.primary}`}>Resend</td>
                <td className={`px-4 py-3 ${formInputColors.helper}`}>
                  Email notifications
                  <br />
                  <Link href="https://resend.com/legal/privacy-policy" className={`text-sm ${linkColors.blue} ${linkHoverColors.blue}`} target="_blank" rel="noopener noreferrer">
                    resend.com/legal/privacy-policy
                  </Link>
                </td>
              </tr>
              <tr>
                <td className={`px-4 py-3 font-medium ${headingColors.primary}`}>Vercel</td>
                <td className={`px-4 py-3 ${formInputColors.helper}`}>
                  Website hosting
                  <br />
                  <Link href="https://vercel.com/legal/privacy-policy" className={`text-sm ${linkColors.blue} ${linkHoverColors.blue}`} target="_blank" rel="noopener noreferrer">
                    vercel.com/legal/privacy-policy
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">Each partner has their own privacy policy. We encourage you to review them.</p>
      </Section>

      {/* Section 4: Cookies and Tracking */}
      <Section title="4. Cookies and Tracking">
        <p>We use cookies to:</p>

        <Subsection title="Essential Cookies">
          <p>Keep you signed in and remember your preferences. These are necessary for the site to work.</p>
        </Subsection>

        <Subsection title="Analytics Cookies">
          <p>Help us understand how visitors use our site so we can make it better. This data is anonymized.</p>
        </Subsection>

        <p className="mt-4">
          You can disable cookies in your browser settings, but some features may not work properly.
        </p>
      </Section>

      {/* Section 5: Data Security */}
      <Section title="5. Data Security">
        <p>We take your security seriously and use:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>HTTPS encryption for all data in transit</li>
          <li>Secure, encrypted database storage</li>
          <li>Regular security audits and updates</li>
          <li>Limited employee access to personal data</li>
          <li>Industry-standard authentication practices</li>
        </ul>
        <p className="mt-4">
          While we do our best to protect your data, no method of transmission over the internet is 100% secure.
        </p>
      </Section>

      {/* Section 6: Your Rights */}
      <Section title="6. Your Rights">
        <p>You have the right to:</p>

        <Subsection title="Access Your Data">
          <p>Request a copy of the personal information we have about you.</p>
        </Subsection>

        <Subsection title="Correct Your Data">
          <p>Update or fix any inaccurate information.</p>
        </Subsection>

        <Subsection title="Delete Your Data">
          <p>Request that we delete your personal information. Some data may be retained for legal or business purposes.</p>
        </Subsection>

        <Subsection title="Opt Out">
          <p>Unsubscribe from marketing emails at any time using the link in our emails.</p>
        </Subsection>

        <p className="mt-4">
          To exercise these rights, email us at{' '}
          <Link href="mailto:hello@needthisdone.com" className={`${linkColors.blue} ${linkHoverColors.blue}`}>
            hello@needthisdone.com
          </Link>
        </p>
      </Section>

      {/* Section 7: Data Retention */}
      <Section title="7. Data Retention">
        <p>We keep your data for as long as needed to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Provide our services to you</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>
        <p className="mt-4">
          When you delete your account, we remove your personal data within 30 days, except where retention is required by law.
        </p>
      </Section>

      {/* Section 8: Children's Privacy */}
      <Section title="8. Children&apos;s Privacy">
        <p>
          Our services are not intended for children under 13. We do not knowingly collect information from children.
        </p>
        <p className="mt-2">
          If you believe a child has provided us with personal information, please contact us and we will delete it.
        </p>
      </Section>

      {/* Section 9: California Privacy Rights */}
      <Section title="9. California Privacy Rights (CCPA)">
        <p>If you&apos;re a California resident, you have additional rights under the CCPA:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Right to know what personal information we collect</li>
          <li>Right to delete your personal information</li>
          <li>Right to opt-out of sale (we don&apos;t sell your data)</li>
          <li>Right to non-discrimination for exercising your rights</li>
        </ul>
      </Section>

      {/* Section 10: Changes to This Policy */}
      <Section title="10. Changes to This Policy">
        <p>
          We may update this policy from time to time. When we do, we&apos;ll update the &quot;Last updated&quot; date at the top.
        </p>
        <p className="mt-2">
          For significant changes, we&apos;ll notify you by email or through a notice on our website.
        </p>
      </Section>

      {/* Section 11: Contact Us */}
      <Section title="11. Contact Us">
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
        <p className="mt-4">We&apos;ll respond within 30 days.</p>
      </Section>

    </div>
  );
}

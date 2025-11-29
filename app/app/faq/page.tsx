import Link from 'next/link';
import { faqColors } from '@/lib/colors';
import CircleBadge from '@/components/CircleBadge';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';

// ============================================================================
// FAQ Page - Common Questions
// ============================================================================
// Answers common questions clients might have about the service.

export const metadata = {
  title: 'FAQ - NeedThisDone',
  description: 'Frequently asked questions about our services.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'What types of tasks do you handle?',
      answer: (
        <>
          We help with all kinds of tasks: spreadsheets and data cleanup, document preparation, administrative work, computer help, and even website builds and updates. Check out our{' '}
          <Link href="/services" className="text-blue-700 dark:text-blue-400 font-medium hover:underline">
            services page
          </Link>{' '}
          to see what we specialize in. If you're not sure whether we can help, just ask! We're happy to discuss your needs.
        </>
      ),
    },
    {
      question: 'Do I need to be tech-savvy to work with you?',
      answer: "Not at all! We work with people of all backgrounds. Just describe what you need in your own words, and we'll take it from there. No technical terms needed.",
    },
    {
      question: 'How long does a typical task take?',
      answer: (
        <>
          Most tasks are completed within a few days to a week. Larger projects may take longer, but we always provide a clear timeline upfront so you know what to expect. Learn more about{' '}
          <Link href="/how-it-works" className="text-blue-700 dark:text-blue-400 font-medium hover:underline">
            how it works
          </Link>.
        </>
      ),
    },
    {
      question: 'How much does it cost?',
      answer: (
        <>
          Pricing depends on the scope and complexity of your task. Check out our{' '}
          <Link href="/pricing" className="text-blue-700 dark:text-blue-400 font-medium hover:underline">
            pricing page
          </Link>{' '}
          for general ranges. We provide transparent quotes with no hidden fees—tell us what you need, and we'll give you a clear estimate before any work begins.
        </>
      ),
    },
    {
      question: 'How do I get started?',
      answer: (
        <>
          Simply reach out through our{' '}
          <Link href="/contact" className="text-blue-700 dark:text-blue-400 font-medium hover:underline">
            contact form
          </Link>{' '}
          and describe what you need help with. We'll review your request and get back to you within 2 business days with questions or a quote.
        </>
      ),
    },
    {
      question: 'Can you help with one-time tasks or just ongoing work?',
      answer: "Both! Whether you have a single task that needs attention or want regular ongoing support, we're here to help. Many clients start with a one-time task and come back when something else comes up.",
    },
    {
      question: 'What if I need changes after delivery?',
      answer: "We want you to be completely satisfied. We include reasonable revisions as part of every task. If something isn't quite right, just let us know and we'll make it right.",
    },
    {
      question: 'How do you handle communication?',
      answer: 'We keep you updated every step of the way. You can expect clear progress updates and quick responses to your questions. We believe good communication makes everything easier.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: "We accept major credit cards and other common payment methods. Payment details are discussed when you approve the quote - no surprises.",
    },
    {
      question: 'What if I have a question that is not listed here?',
      answer: (
        <>
          We'd love to hear from you! Reach out through our{' '}
          <Link href="/contact" className="text-blue-700 dark:text-blue-400 font-medium hover:underline">
            contact page
          </Link>{' '}
          and we'll be happy to answer any questions you have.
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title="Frequently Asked Questions"
          description="Your questions, answered."
        />

        {/* FAQ List */}
        <div className="space-y-6 mb-10">
          {faqs.map((faq, index) => {
            // Cycle through colors: purple, blue, green, orange
            const colors = ['purple', 'blue', 'green', 'orange'] as const;
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
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <CTASection
          title="Still Have Questions?"
          description="We're here to help. Reach out and we'll get back to you promptly."
          buttons={[
            { text: 'Get In Touch', variant: 'orange', href: '/contact' },
            { text: 'View Pricing', variant: 'teal', href: '/pricing' }
          ]}
          hoverColor="orange"
        />
      </div>
    </div>
  );
}

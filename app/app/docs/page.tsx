import Link from 'next/link';

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
      question: 'What types of projects do you handle?',
      answer: 'We handle a variety of projects including web development, technical consulting, and ongoing support. If you are not sure whether we can help, just ask - we are happy to discuss your needs.',
    },
    {
      question: 'How long does a typical project take?',
      answer: 'Most projects are completed within 1-2 weeks. Larger or more complex projects may take longer. We provide a clear timeline with every quote so you know what to expect.',
    },
    {
      question: 'How much does it cost?',
      answer: 'Pricing depends on the scope and complexity of your project. We provide transparent quotes with no hidden fees. Submit your project details and we will give you a clear estimate.',
    },
    {
      question: 'How do I get started?',
      answer: 'Simply reach out with your project details. We will review your request and get back to you within 2 business days with questions or a quote.',
    },
    {
      question: 'What if I need changes after delivery?',
      answer: 'We want you to be satisfied with the work. We include reasonable revisions as part of every project. If you need changes, just let us know and we will address them.',
    },
    {
      question: 'How do you handle communication?',
      answer: 'We keep you updated throughout the project. You can expect regular progress updates and quick responses to your questions. Clear communication is a priority.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards and other common payment methods. Payment details are discussed when you approve the quote.',
    },
    {
      question: 'Do you offer ongoing support?',
      answer: 'Yes! We offer ongoing support and maintenance services. This is great for projects that need regular updates or for clients who want continued assistance.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Common questions about working with us.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6 mb-16">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {faq.question}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-8 border border-blue-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We are here to help. Reach out and we will get back to you promptly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/how-it-works"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Learn How It Works
            </Link>
            <Link
              href="/features"
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

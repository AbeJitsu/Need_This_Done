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
      question: 'What types of tasks do you handle?',
      answer: "We help with all kinds of tasks: spreadsheets and data cleanup, document preparation, administrative work, computer help, and even website builds and updates. If you're not sure whether we can help, just ask! We're happy to discuss your needs.",
    },
    {
      question: 'Do I need to be tech-savvy to work with you?',
      answer: "Not at all! We work with people of all technical backgrounds. Just describe what you need in your own words, and we'll take it from there. No jargon required.",
    },
    {
      question: 'How long does a typical task take?',
      answer: 'Most tasks are completed within a few days to a week. Larger projects may take longer, but we always provide a clear timeline upfront so you know what to expect.',
    },
    {
      question: 'How much does it cost?',
      answer: "Pricing depends on the scope and complexity of your task. We provide transparent quotes with no hidden fees. Tell us what you need, and we'll give you a clear estimate before any work begins.",
    },
    {
      question: 'How do I get started?',
      answer: "Simply reach out through our contact form and describe what you need help with. We'll review your request and get back to you within 2 business days with questions or a quote.",
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
      answer: "We'd love to hear from you! Reach out through our contact page and we'll be happy to answer any questions you have.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your questions, answered.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6 mb-10">
          {faqs.map((faq, index) => {
            // Cycle through colors: purple, blue, green
            const colors = ['purple', 'blue', 'green'] as const;
            const color = colors[index % 3];
            const colorClasses = {
              purple: {
                border: 'border-l-purple-500',
                text: 'text-purple-700 dark:text-purple-300',
                bg: 'bg-purple-100 dark:bg-purple-700',
                numText: 'text-purple-700 dark:text-white',
                hover: 'hover:border-purple-400 dark:hover:border-purple-400',
              },
              blue: {
                border: 'border-l-blue-500',
                text: 'text-blue-700 dark:text-blue-300',
                bg: 'bg-blue-100 dark:bg-blue-700',
                numText: 'text-blue-700 dark:text-white',
                hover: 'hover:border-blue-400 dark:hover:border-blue-400',
              },
              green: {
                border: 'border-l-green-500',
                text: 'text-green-700 dark:text-green-300',
                bg: 'bg-green-100 dark:bg-green-700',
                numText: 'text-green-700 dark:text-white',
                hover: 'hover:border-green-400 dark:hover:border-green-400',
              },
            };
            const styles = colorClasses[color];
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 border-l-4 ${styles.border} ${styles.hover} transition-all hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.bg} flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${styles.numText}`}>{index + 1}</span>
                  </div>
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-gray-800 dark:from-transparent dark:to-transparent rounded-xl p-6 border border-blue-200 dark:border-blue-700 text-center transition-all hover:border-blue-300 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-blue-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're here to help. Reach out and we'll get back to you promptly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/how-it-works"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Learn How It Works
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

// ============================================================================
// How It Works Page - The NeedThisDone Process
// ============================================================================
// Explains the step-by-step process for clients from submission to completion.

export const metadata = {
  title: 'How It Works - NeedThisDone',
  description: 'Learn about our simple process for getting your projects done.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Submit Your Project',
      description: 'Tell us what you need done. Be as detailed as possible - include files, examples, and any questions you have.',
      details: [
        'Fill out our project request form',
        'Attach any relevant files or documents',
        'Describe your timeline and expectations',
      ],
    },
    {
      number: 2,
      title: 'We Review & Respond',
      description: 'We carefully review your request and get back to you within 2 business days with questions or a quote.',
      details: [
        'We assess the scope of work',
        'We ask clarifying questions if needed',
        'You receive a clear quote with timeline',
      ],
    },
    {
      number: 3,
      title: 'Project Begins',
      description: 'Once you approve, we get to work. We keep you updated on progress throughout the project.',
      details: [
        'Work begins on your project',
        'Regular updates on progress',
        'Open communication for questions',
      ],
    },
    {
      number: 4,
      title: 'Review & Deliver',
      description: 'You review the completed work. We make any needed adjustments until you are satisfied.',
      details: [
        'You review the deliverables',
        'We address any feedback',
        'Final delivery and handoff',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A simple, straightforward process to get your project done right.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Note */}
        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-gray-700 mb-16">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Typical Timeline
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Most projects are completed within 1-2 weeks, depending on scope.
            Larger projects may take longer - we will provide a clear timeline with your quote.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Check our FAQ or view our services to learn more.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/docs"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View FAQ
            </Link>
            <Link
              href="/features"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

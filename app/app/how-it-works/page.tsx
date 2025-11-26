import Link from 'next/link';

// ============================================================================
// How It Works Page - The NeedThisDone Process
// ============================================================================
// Explains the step-by-step process for clients from submission to completion.

export const metadata = {
  title: 'How It Works - NeedThisDone',
  description: 'Our simple process for getting your tasks done. Tell us what you need, and we take it from there.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Tell Us What You Need',
      description: 'Describe your task in your own words. Include any files, examples, or questions. No tech speak required.',
      details: [
        'Fill out our simple contact form',
        'Attach any relevant files or documents',
        'Let us know your timeline if you have one',
      ],
    },
    {
      number: 2,
      title: 'We Review & Respond',
      description: 'We carefully review your request and get back to you within 2 business days with questions or a clear quote.',
      details: [
        'We assess what needs to be done',
        'We ask clarifying questions if needed',
        'You receive a straightforward quote',
      ],
    },
    {
      number: 3,
      title: 'We Get to Work',
      description: 'Once you give the go-ahead, we start on your task. We keep you updated so you always know where things stand.',
      details: [
        'Work begins on your task',
        'Regular updates on progress',
        'Open communication for questions',
      ],
    },
    {
      number: 4,
      title: 'Review & Deliver',
      description: 'You review the completed work. We make any needed adjustments until you are completely satisfied.',
      details: [
        'You review what we have done',
        'We address any feedback',
        'Final delivery. Task complete!',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Here's how we work together to get your project done right.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {steps.map((step) => {
            // Color progression: purple -> blue -> green -> repeat
            const stepColors = {
              1: { bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', bullet: 'text-purple-600 dark:text-purple-400' },
              2: { bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', bullet: 'text-blue-600 dark:text-blue-400' },
              3: { bg: 'bg-green-600', text: 'text-green-600 dark:text-green-400', bullet: 'text-green-600 dark:text-green-400' },
              4: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bullet: 'text-amber-600 dark:text-amber-400' },
            };
            const colors = stepColors[step.number as keyof typeof stepColors];
            return (
              <div
                key={step.number}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]"
              >
                <div className="flex items-start gap-6">
                  <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} text-white rounded-full flex items-center justify-center text-xl font-bold`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                      {step.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className={colors.bullet}>•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Note */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-10 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
          <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Typical Timeline
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Most projects are completed within 1-2 weeks, depending on scope.
            Larger projects may take longer - we'll provide a clear timeline with your quote.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Check out our FAQ or explore our services.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/faq"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 hover:text-white transition-colors"
            >
              View FAQ
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
